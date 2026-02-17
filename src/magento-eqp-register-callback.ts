import { Node, NodeAPI, NodeDef, NodeMessage } from 'node-red';
import { MagentoEQPConfigNode } from './types';

interface Config extends NodeDef {
	config: string;
}

module.exports = function (RED: NodeAPI) {
	function MagentoEQPRegisterCallback(this: Node, config: Config) {
		RED.nodes.createNode(this, config);

		const configNode = RED.nodes.getNode(config.config) as MagentoEQPConfigNode | null;

		if (!configNode) {
			this.status({
				fill: 'red',
				shape: 'ring',
				text: 'Configuration node not found'
			});
			return;
		}

		this.on('input', async (msg: NodeMessage) => {
			const { name, password, url, username } = msg.payload as Record<string, string>;

			try {
				if (!(name && password && url && username)) {
					throw new Error('username, name, password or url missing');
				}

				msg.payload = await configNode.eqp.callbackService.registerCallback(name, url, username, password);

				this.send(msg);
			} catch (err) {
				const error = err as Error;

				this.status({
					fill: 'red',
					shape: 'ring',
					text: error.toString()
				});
			}
		});
	}

	RED.nodes.registerType('magento-eqp-register-callback', MagentoEQPRegisterCallback);
};
