import { History } from "history";

export interface AbstractPageProps {
	history: History;
}

export interface InventoryResponse {
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

export interface InventoryItem {
	template: string;
	count: number;
}

export interface InventoryTool {
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
