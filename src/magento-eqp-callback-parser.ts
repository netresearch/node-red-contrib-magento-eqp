import { EQPStatusUpdateEvent, HttpError, MalwareScanCompleteEvent } from '@netresearch/node-magento-eqp';
import { Node, NodeAPI, NodeDef, NodeMessage } from 'node-red';
import { MagentoEQPConfigNode } from './types';

interface Config extends NodeDef {
	config: string;
}

module.exports = function (RED: NodeAPI) {
	function MagentoEQPCallbackParser(this: Node, config: Config) {
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
			try {
				const payload = msg.payload as EQPStatusUpdateEvent | MalwareScanCompleteEvent;

				if (!(payload.callback_event && payload.update_info)) {
					throw new Error('incomplete event');
				}

				if (payload.callback_event === 'malware_scan_complete') {
					msg.payload = await configNode.eqp.callbackService.parseCallback(payload);
				} else {
					msg.payload = await configNode.eqp.callbackService.parseCallback(payload);
				}

				this.send([msg, null]);
			} catch (err) {
				const error = err as Error;
				const httpResponse = err instanceof HttpError ? err.data : null;
				const httpError = httpResponse ? JSON.stringify(httpResponse) : '';
				const errorString = `${error}: ${httpError}`;

				this.status({
					fill: 'red',
					shape: 'ring',
					text: errorString
				});

				this.send([null, { ...error, httpResponse, payload: errorString } as NodeMessage]);
			}
		});
	}

	RED.nodes.registerType('magento-eqp-callback-parser', MagentoEQPCallbackParser);
};
