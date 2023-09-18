import { EQP } from '@netresearch/node-magento-eqp';
import { NodeProperties, Red } from 'node-red';
import { Node } from 'node-red-contrib-typescript-node';

type Environment = 'production' | 'sandbox';

class RedNode extends Node {
	credentials: Record<string, string> = {};
}

interface Config extends NodeProperties {
	appId: string;
	appSecret: string;
	environment: Environment;
	autoRefresh: boolean;
}

export class MagentoEQPConfig extends RedNode {
	eqp: EQP;

	readonly appId: string;
	readonly appSecret: string;
	readonly environment: Environment;

	constructor(config: Config, RED: Red) {
		super(RED);

		this.createNode(config);

		if (!(this.credentials.appId && this.credentials.appSecret)) {
			throw new Error('App ID or secret missing');
		}

		this.appId = this.credentials.appId;
		this.appSecret = this.credentials.appSecret;
		this.environment = config.environment;

		this.eqp = new EQP({
			environment: config.environment ?? 'production',
			autoRefresh: config.autoRefresh ?? true,
			appId: this.appId,
			appSecret: this.appSecret
		});
	}
}

module.exports = function (RED: Red) {
	class MagentoEQPConfigWrapper extends MagentoEQPConfig {
		constructor(config: Config) {
			super(config, RED);
		}
	}

	MagentoEQPConfigWrapper.registerType(RED, 'magento-eqp-config', {
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
