import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRED, createMockNode, MockRED, MockNode } from './helpers/node-red-mock';

describe('magento-eqp-register-callback', () => {
	let RED: MockRED;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	async function loadModule(nodeStore: Record<string, unknown> = {}) {
		RED = createMockRED(nodeStore);
		const moduleExport = await import('../magento-eqp-register-callback');
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

			expect(RED.nodes.registerType).toHaveBeenCalledWith('magento-eqp-register-callback', expect.any(Function));
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
	});

	describe('input handling', () => {
		let configNode: { eqp: { callbackService: { registerCallback: ReturnType<typeof vi.fn> } } };
		let node: MockNode;

		beforeEach(() => {
			configNode = {
				eqp: {
					callbackService: {
						registerCallback: vi.fn().mockResolvedValue({ mage_id: 'MAG123' })
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

		it('should call registerCallback with all fields and send result', async () => {
			const node = await setupNode();
			const msg = {
				payload: {
					name: 'My CB',
					password: 'pass',
					url: 'https://example.com',
					username: 'admin'
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.send).toHaveBeenCalled());

			expect(configNode.eqp.callbackService.registerCallback).toHaveBeenCalledWith('My CB', 'https://example.com', 'admin', 'pass');
			expect(node.send).toHaveBeenCalledWith(
				expect.objectContaining({
					payload: { mage_id: 'MAG123' }
				})
			);
		});

		it('should error when name is missing', async () => {
			const node = await setupNode();
			const msg = {
				payload: { password: 'pass', url: 'https://example.com', username: 'admin' }
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).not.toHaveBeenCalled();
		});

		it('should error when password is missing', async () => {
			const node = await setupNode();
			const msg = {
				payload: { name: 'My CB', url: 'https://example.com', username: 'admin' }
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).not.toHaveBeenCalled();
		});

		it('should error when url is missing', async () => {
			const node = await setupNode();
			const msg = {
				payload: { name: 'My CB', password: 'pass', username: 'admin' }
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).not.toHaveBeenCalled();
		});

		it('should error when username is missing', async () => {
			const node = await setupNode();
			const msg = {
				payload: { name: 'My CB', password: 'pass', url: 'https://example.com' }
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).not.toHaveBeenCalled();
		});

		it('should set error status when API call fails', async () => {
			configNode.eqp.callbackService.registerCallback.mockRejectedValue(new Error('API error'));

			const node = await setupNode();
			const msg = {
				payload: {
					name: 'My CB',
					password: 'pass',
					url: 'https://example.com',
					username: 'admin'
				}
			};

			node.emit('input', msg);
			await vi.waitFor(() => expect(node.status).toHaveBeenCalled());

			expect(node.status).toHaveBeenCalledWith(expect.objectContaining({ fill: 'red', shape: 'ring' }));
			expect(node.send).not.toHaveBeenCalled();
		});
	});
});
