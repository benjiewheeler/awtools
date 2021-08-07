import { History } from "history";

export interface AbstractPageProps {
	history: History;
}

export interface InventoryTemplatesResponse {
	success: boolean;
	data: {
		schemas: {
			schema_name: string;
			assets: string;
		}[];
		templates: {
			template_id: string;
			assets: string;
		}[];
	};
}

export interface InventoryTemplateItem {
	template: string;
	count: number;
}

export interface InventoryAssetsResponse {
	success: boolean;
	data: {
		asset_id: string;
		name: string;
		template: {
			template_id: string;
		};
	}[];
}

export interface InventoryAssetItem {
	template: string;
	asset: string;
}

export interface InventoryTool {
	assets?: InventoryAssetItem[];
	tool: ToolItem;
	count: number;
}

export interface ToolItem {
	name: string;
	rarity: string;
	type: string;
	shine: string;
	delay: number;
	power: number;
	luck: number;
	difficulty: number;
	template: string;
	asset?: string;
	img: string;
}

export interface LandItem {
	asset: string;
	template: string;
	name: string;
	planet: string;
	coordinates: string;
	commission: number;
	rarity: string;
	delay: number;
	power: number;
	luck: number;
	difficulty: number;
	img: string;
}

export interface HashParams {
	account?: string;
	[key: string]: string | number | (string | number)[];
}

export interface BalanceItem {
	wax: number;
	tlm: number;
}

export interface MineHistoryResponse {
	actions: {
		timestamp: string;
		act: {
			name: string;
			data: { amount: number };
		};
	}[];
}

export interface MineHistoryItem {
	date: Date;
	amount: number;
}

export interface AccountInfoResponse {
	created: string;
	ram_quota: number;
	net_weight: number;
	cpu_weight: string;
	net_limit: { used: number; available: number; max: number };
	cpu_limit: { used: number; available: number; max: number };
	ram_usage: number;
}

export interface AccountInfoItem {
	created: Date;
	ram: { total: number; used: number };
	cpu: { total: number; used: number; staked: number };
	net: { total: number; used: number; staked: number };
}

export interface AccountBagResponse {
	rows: [
		{
			account: string;
			items: string[];
			locked: number;
		}
	];
}

export interface AccountMinersResponse {
	rows: [
		{
			miner: string;
			last_mine_tx: string;
			last_mine: string;
			current_land: string;
		}
	];
}

export interface AssetInfoResponse {
	success: boolean;
	data: {
		asset_id: string;
		template: {
			template_id: string;
		};
	};
}

export interface ChainInfoResponse {
	server_version: string;
	chain_id: string;
	head_block_num: number;
	last_irreversible_block_num: number;
	last_irreversible_block_id: string;
	head_block_id: string;
	head_block_time: string;
	head_block_producer: string;
	virtual_block_cpu_limit: number;
	virtual_block_net_limit: number;
	block_cpu_limit: number;
	block_net_limit: number;
	server_version_string: string;
	fork_db_head_block_num: number;
	fork_db_head_block_id: string;
	server_full_version_string: string;
}

export interface ChainInfoItem {
	virtualCPULimit: number;
}

export interface CacheObject<T> {
	expiration: number;
	value: T;
}

export interface InventoryValueResponse {
	success: boolean;
	data: [
		{
			token_precision: number;
			median: string;
			average: string;
			min: string;
			max: string;
			suggested_median: string;
			suggested_average: string;
		}
	];
}
