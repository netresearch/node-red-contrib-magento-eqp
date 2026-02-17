import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRED, createMockNode, MockRED } from './helpers/node-red-mock';

// Mock EQP before importing the module
vi.mock('@netresearch/node-magento-eqp', () => ({
	EQP: vi.fn().mockImplementation(function () {
		return {
			fileService: {},
			userService: {},
			keyService: {},
			callbackService: {},
			reportService: {},
			packageService: {},
			getMageId: vi.fn()
		};
	})
}));

import { EQP } from '@netresearch/node-magento-eqp';

describe('magento-eqp-config', () => {
	let RED: MockRED;

	beforeEach(() => {
		vi.clearAllMocks();
		RED = createMockRED();
	});

	async function loadModule() {
		const moduleExport = await import('../magento-eqp-config');
		const init = moduleExport.default ?? moduleExport;
		init(RED);
	}

	async function getConstructor() {
		await loadModule();
		return RED.nodes.registerType.mock.calls[0][1];
	}

	describe('registration', () => {
		it('should register with correct type name', async () => {
			await loadModule();

			expect(RED.nodes.registerType).toHaveBeenCalledWith(
				'magento-eqp-config',
				expect.any(Function),
				expect.objectContaining({
					credentials: {
						appId: { type: 'text' },
						appSecret: { type: 'password' }
					}
				})
			);
		});

		it('should register with correct settings', async () => {
			await loadModule();

			const options = RED.nodes.registerType.mock.calls[0][2];
			expect(options.settings).toEqual({
				magentoEqpConfigenvironment: { value: 'production', exportable: true },
				magentoEqpConfigautoRefresh: { value: true, exportable: true }
			});
		});
	});

	describe('construction', () => {
		it('should call createNode', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'id', appSecret: 'secret' } });
			const config = { environment: 'production', autoRefresh: true };

			Constructor.call(node, config);

			expect(RED.nodes.createNode).toHaveBeenCalledWith(node, config);
		});

		it('should throw when appId is missing', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appSecret: 'secret' } });

			expect(() => Constructor.call(node, {})).toThrow('App ID or secret missing');
		});

		it('should throw when appSecret is missing', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'id' } });

			expect(() => Constructor.call(node, {})).toThrow('App ID or secret missing');
		});

		it('should throw when both credentials are missing', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: {} });

			expect(() => Constructor.call(node, {})).toThrow('App ID or secret missing');
		});

		it('should throw when appId is empty string', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: '', appSecret: 'secret' } });

			expect(() => Constructor.call(node, {})).toThrow('App ID or secret missing');
		});

		it('should throw when appSecret is empty string', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'id', appSecret: '' } });

			expect(() => Constructor.call(node, {})).toThrow('App ID or secret missing');
		});

		it('should instantiate EQP with correct options', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'my-id', appSecret: 'my-secret' } });
			const config = { environment: 'sandbox', autoRefresh: false };

			Constructor.call(node, config);

			expect(EQP).toHaveBeenCalledWith({
				environment: 'sandbox',
				autoRefresh: false,
				appId: 'my-id',
				appSecret: 'my-secret'
			});
		});

		it('should default environment to production', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'id', appSecret: 'secret' } });

			Constructor.call(node, {});

			expect(EQP).toHaveBeenCalledWith(expect.objectContaining({ environment: 'production' }));
		});

		it('should default autoRefresh to true', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'id', appSecret: 'secret' } });

			Constructor.call(node, {});

			expect(EQP).toHaveBeenCalledWith(expect.objectContaining({ autoRefresh: true }));
		});

		it('should set node properties', async () => {
			const Constructor = await getConstructor();
			const node = createMockNode({ credentials: { appId: 'my-id', appSecret: 'my-secret' } });
			const config = { environment: 'sandbox' };

			Constructor.call(node, config);

			expect(node.appId).toBe('my-id');
			expect(node.appSecret).toBe('my-secret');
			expect(node.environment).toBe('sandbox');
			expect(node.eqp).toBeDefined();
		});
	});
});
