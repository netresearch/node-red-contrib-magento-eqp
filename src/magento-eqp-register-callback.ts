import { NodeProperties, Red } from 'node-red';
import { Node } from 'node-red-contrib-typescript-node';
import { Message } from './common';
import { MagentoEQPConfig } from './magento-eqp-config';

interface Config extends NodeProperties {
	config: string;
}

class MagentoEQPRegisterCallback extends Node {
	protected configNode?: MagentoEQPConfig;

	constructor(config: Config, RED: Red) {
		super(RED);

		this.createNode(config);

		const configNode = RED.nodes.getNode(config.config);

		if (!configNode) {
			this.status({
				fill: 'red',
				shape: 'ring',
				text: `Configuration node not found`
			});

			return;
		}

		this.configNode = configNode as MagentoEQPConfig;

		this.on('input', async (msg: Message) => {
			if (!this.configNode) {
				this.status({
					fill: 'red',
					shape: 'ring',
					text: `Configuration node not found`
				});

				return;
			}

			const { name, password, url, username } = msg.payload as Record<string, string>;

			try {
				if (!(name && password && url && username)) {
					throw new Error('username, name, password or url missing');
				}

				msg.payload = await this.configNode.eqp.registerCallback(name, url, username, password);

				this.send(msg);
			} catch (error) {
				this.status({
					fill: 'red',
					shape: 'ring',
					text: error.response ? JSON.stringify(error.response.data) : error
				});
			}
		});
	}
}

module.exports = function (RED: Red) {
	class MagentoEQPRegisterCallbackWrapper extends MagentoEQPRegisterCallback {
		constructor(config: Config) {
			super(config, RED);
		}
	}

	MagentoEQPRegisterCallbackWrapper.registerType(RED, 'magento-eqp-register-callback');
};
