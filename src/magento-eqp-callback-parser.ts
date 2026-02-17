import { EQPStatusUpdateEvent, HttpError, MalwareScanCompleteEvent } from '@netresearch/node-magento-eqp';
import { NodeProperties, Red } from 'node-red';
import { Node } from 'node-red-contrib-typescript-node';
import { Message } from './common';
import { MagentoEQPConfig } from './magento-eqp-config';

interface Config extends NodeProperties {
	config: string;
}

class MagentoEQPCallbackParser extends Node {
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
			try {
				if (!this.configNode) {
					throw new Error('configuration node not set');
				}

				const payload = msg.payload as EQPStatusUpdateEvent | MalwareScanCompleteEvent;

				if (!(payload.callback_event && payload.update_info)) {
					throw new Error('incomplete event');
				}

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				msg.payload = await this.configNode.eqp.callbackService.parseCallback(payload);

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

				this.send([null, { ...error, httpResponse, payload: errorString }]);
			}
		});
	}
}

module.exports = function(RED: Red) {
	class MagentoEQPCallbackParserWrapper extends MagentoEQPCallbackParser {
		constructor(config: Config) {
			super(config, RED);
		}
	}

	MagentoEQPCallbackParserWrapper.registerType(RED, 'magento-eqp-callback-parser');
};
