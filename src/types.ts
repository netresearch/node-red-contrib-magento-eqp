import { EQP } from '@netresearch/node-magento-eqp';
import { Node } from 'node-red';

export interface MagentoEQPConfigNode extends Node {
	eqp: EQP;
	appId: string;
	appSecret: string;
	environment: 'production' | 'sandbox';
}
