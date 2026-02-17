import { vi } from 'vitest';
import { EventEmitter } from 'events';

export interface MockNode extends EventEmitter {
	status: ReturnType<typeof vi.fn>;
	send: ReturnType<typeof vi.fn>;
	error: ReturnType<typeof vi.fn>;
	credentials: Record<string, string>;
	id: string;
	type: string;
	name: string;
}

export function createMockNode(overrides: Partial<MockNode> = {}): MockNode {
	const node = new EventEmitter() as MockNode;
	node.status = vi.fn();
	node.send = vi.fn();
	node.error = vi.fn();
	node.credentials = {};
	node.id = 'test-node-id';
	node.type = 'test-type';
	node.name = 'test-name';
	Object.assign(node, overrides);
	return node;
}

export interface MockRED {
	nodes: {
		createNode: ReturnType<typeof vi.fn>;
		getNode: ReturnType<typeof vi.fn>;
		registerType: ReturnType<typeof vi.fn>;
	};
}

export function createMockRED(nodeStore: Record<string, unknown> = {}): MockRED {
	return {
		nodes: {
			createNode: vi.fn(),
			getNode: vi.fn((id: string) => nodeStore[id] ?? null),
			registerType: vi.fn()
		}
	};
}
