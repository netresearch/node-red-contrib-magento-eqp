import { EQP } from '@netresearch/node-magento-eqp';
import { NodeAPI, NodeDef } from 'node-red';
import { MagentoEQPConfigNode } from './types';

type Environment = 'production' | 'sandbox';

interface Config extends NodeDef {
	appId: string;
	appSecret: string;
	environment: Environment;
	autoRefresh: boolean;
}

module.exports = function (RED: NodeAPI) {
	function MagentoEQPConfig(this: MagentoEQPConfigNode, config: Config) {
		RED.nodes.createNode(this, config);

		const credentials = this.credentials as Record<string, string>;

		if (!(credentials.appId && credentials.appSecret)) {
			throw new Error('App ID or secret missing');
		}

		this.appId = credentials.appId;
		this.appSecret = credentials.appSecret;
		this.environment = config.environment;

		this.eqp = new EQP({
			environment: config.environment ?? 'production',
			autoRefresh: config.autoRefresh ?? true,
			appId: this.appId,
			appSecret: this.appSecret
		});
	}

	RED.nodes.registerType('magento-eqp-config', MagentoEQPConfig as never, {
		settings: {
			magentoEqpConfigenvironment: {
				value: 'production',
				exportable: true
			},
			magentoEqpConfigautoRefresh: {
				value: true,
				exportable: true
			}
		},
		credentials: {
			appId: {
				type: 'text'
			},
			appSecret: {
				type: 'password'
			}
		}
	});
};
