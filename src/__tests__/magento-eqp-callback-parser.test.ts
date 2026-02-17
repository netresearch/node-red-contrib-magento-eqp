import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRED, createMockNode, MockRED, MockNode } from './helpers/node-red-mock';

// Mock the EQP module
vi.mock('@netresearch/node-magento-eqp', () => ({
	HttpError: class HttpError extends Error {
		readonly status: number;
		readonly statusText: string;
		readonly data: unknown;
		constructor(status: number, statusText: string, data: unknown) {
			super(`HTTP ${status}: ${statusText}`);
			this.name = 'HttpError';
			this.status = status;
			this.statusText = statusText;
			this.data = data;
		}
	}
}));

import { HttpError } from '@netresearch/node-magento-eqp';

describe('magento-eqp-callback-parser', () => {
	let RED: MockRED;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	async function loadModule(nodeStore: Record<string, unknown> = {}) {
		RED = createMockRED(nodeStore);
		const moduleExport = await import('../magento-eqp-callback-parser');
		const init = moduleExport.default ?? moduleExport;
		init(RED);
	}

	async function getConstructor(nodeStore: Record<string, unknown> = {}) {
		await loadModule(nodeStore);
		return RED.nodes.registerType.mock.calls[0][1];
	}

	describe('registration', () => {
		it('should register with correct type name', async () => {
			await loadModule();

			expect(RED.nodes.registerType).toHaveBeenCalledWith('magento-eqp-callback-parser', expect.any(Function));
		});
	});

	describe('missing config node', () => {
		it('should set error status when config node not found', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode();

			Constructor.call(node, { config: 'missing-id' });

			expect(node.status).toHaveBeenCalledWith({
				fill: 'red',
				shape: 'ring',
				text: 'Configuration node not found'
			});
		});

		it('should not register input listener when config node not found', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode();
			const onSpy = vi.spyOn(node, 'on');

			Constructor.call(node, { config: 'missing-id' });

			expect(onSpy).not.toHaveBeenCalledWith('input', expect.any(Function));
		});
	});

	describe('input handling', () => {
		let configNode: { eqp: { callbackService: { parseCallback: ReturnType<typeof vi.fn> } } };
		let node: MockNode;

		beforeEach(() => {
			configNode = {
				eqp: {
					callbackService: {
						parseCallback: vi.fn()
					}
				}
			};
		});

		async function setupNode() {
			const Constructor = await getConstructor({ 'config-1': configNode });
			node = createMockNode();
			Constructor.call(node, { config: 'config-1' });
			return node;
		}

		it('should handle eqp_status_update event', async () => {
			const parsedResult = { submission: {}, status: 'approved', flow: 'technical' };
			configNode.eqp.callbackService.parseCallback.mockResolvedValue(parsedResult);

			const node = await setupNode();
			const msg = {
				payload: {
					callback_event: 'eqp_status_update',
					update_info: {
						submission_id: 'sub-1',
						item_id: 'item-1',
						eqp_flow: 'technical',
						eqp_state: 'approved'
					}
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.send).toHaveBeenCalled());

			expect(node.send).toHaveBeenCalledWith([expect.objectContaining({ payload: parsedResult }), null]);
		});

		it('should handle malware_scan_complete event', async () => {
			const parsedResult = { file: {}, submissions: [], result: 'pass' };
			configNode.eqp.callbackService.parseCallback.mockResolvedValue(parsedResult);

			const node = await setupNode();
			const msg = {
				payload: {
					callback_event: 'malware_scan_complete',
					update_info: { file_upload_id: 'file-1', tool_result: 'pass' }
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.send).toHaveBeenCalled());

			expect(node.send).toHaveBeenCalledWith([expect.objectContaining({ payload: parsedResult }), null]);
		});

		it('should error on missing callback_event', async () => {
			const node = await setupNode();
			const msg = { payload: { update_info: {} } };

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).toHaveBeenCalledWith([
				null,
				expect.objectContaining({
					payload: expect.stringContaining('incomplete event')
				})
			]);
		});

		it('should error on missing update_info', async () => {
			const node = await setupNode();
			const msg = { payload: { callback_event: 'eqp_status_update' } };

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).toHaveBeenCalledWith([
				null,
				expect.objectContaining({
					payload: expect.stringContaining('incomplete event')
				})
			]);
		});

		it('should extract .data from HttpError into httpResponse', async () => {
			const httpErrorData = { error: 'api error', code: 403 };
			configNode.eqp.callbackService.parseCallback.mockRejectedValue(new HttpError(403, 'Forbidden', httpErrorData));

			const node = await setupNode();
			const msg = {
				payload: {
					callback_event: 'eqp_status_update',
					update_info: {
						submission_id: 'sub-1',
						item_id: 'item-1',
						eqp_flow: 'technical',
						eqp_state: 'failed'
					}
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.send).toHaveBeenCalled());

			const errorMsg = node.send.mock.calls[0][0][1];
			expect(errorMsg.httpResponse).toEqual(httpErrorData);
			expect(errorMsg.payload).toContain(JSON.stringify(httpErrorData));
		});

		it('should set httpResponse to null for generic Error', async () => {
			configNode.eqp.callbackService.parseCallback.mockRejectedValue(new Error('generic error'));

			const node = await setupNode();
			const msg = {
				payload: {
					callback_event: 'eqp_status_update',
					update_info: {
						submission_id: 'sub-1',
						item_id: 'item-1',
						eqp_flow: 'technical',
						eqp_state: 'failed'
					}
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.send).toHaveBeenCalled());

			const errorMsg = node.send.mock.calls[0][0][1];
			expect(errorMsg.httpResponse).toBeNull();
		});

		it('should send error on second output index', async () => {
			configNode.eqp.callbackService.parseCallback.mockRejectedValue(new Error('some error'));

			const node = await setupNode();
			const msg = {
				payload: {
					callback_event: 'eqp_status_update',
					update_info: {
						submission_id: 'sub-1',
						item_id: 'item-1',
						eqp_flow: 'technical',
						eqp_state: 'failed'
					}
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.send).toHaveBeenCalled());

			const sendArgs = node.send.mock.calls[0][0];
			expect(sendArgs[0]).toBeNull();
			expect(sendArgs[1]).toBeDefined();
		});
	});
});
