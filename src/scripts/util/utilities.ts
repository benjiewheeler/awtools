import axios from "axios";
import _ from "lodash";
import awtools from "../../assets/awtools.json";
import "../../style/builder.less";
import {
	AccountInfoItem,
	AccountInfoResponse,
	BalanceItem,
	InventoryItem,
	InventoryResponse,
	MineHistoryItem,
	MineHistoryResponse,
	ToolItem,
} from "../types/types";

export async function getInventory(account: string, collection = "alien.worlds"): Promise<InventoryItem[]> {
	const url = `https://wax.api.atomicassets.io/atomicassets/v1/accounts/${account}/${collection}`;
	const response = await axios.get<InventoryResponse>(url, { timeout: 10e3 });

	return response?.data?.data?.templates?.map(t => ({
		template: t.template_id,
		count: parseInt(t.assets),
	}));
}

export function findTool(id: string): ToolItem {
	for (let i = 0; i < awtools.length; i++) {
		if (awtools[i].template === id) {
			return awtools[i];
		}
	}
	return null;
}

export function calculateToolsPower(tools: ToolItem[]): number {
	return _(tools).sumBy(t => t.power);
}

export function calculateToolsLuck(tools: ToolItem[]): number {
	return _(tools).sumBy(t => t.luck);
}

export function calculateToolsDelay(tools: ToolItem[]): number {
	const delays = _(tools)
		.map(t => t.delay)
		.value();
	switch (delays.length) {
		case 1:
			return _.sum(delays);
		case 2:
			return _.sum(delays) - Math.floor(_.min(delays) / 2);
		case 3:
			return _.sum(delays) - _.min(delays);
	}

	return _.sum(delays) - _.min(delays);
}

export async function fetchMineHistory(account: string): Promise<MineHistoryItem[]> {
	const url = `https://api.waxsweden.org/v2/history/get_actions`;
	const response = await axios.get<MineHistoryResponse>(url, {
		params: {
			"account": account,
			"skip": 0,
			"limit": 100,
			"sort": "desc",
			"transfer.to": account,
			"transfer.from": "m.federation",
		},
		timeout: 10e3,
	});

	return response?.data?.actions
		?.filter(m => m.act.name === "transfer")
		?.map(m => ({
			date: new Date(`${m.timestamp}Z`),
			amount: m?.act?.data?.amount,
		}));
}

export async function fetchTokenBalance(code: string, account: string, symbol: string): Promise<number> {
	const url = `https://wax.greymass.com/v1/chain/get_currency_balance`;
	const response = await axios.post<string[]>(url, { code, account, symbol }, { timeout: 10e3 });

	return parseFloat(response?.data?.pop());
}

export async function fetchAccountInfo(account: string): Promise<AccountInfoItem> {
	const url = `https://wax.pink.gg/v1/chain/get_account`;
	const response = await axios.post<AccountInfoResponse>(url, { account_name: account }, { timeout: 10e3 });

	return {
		created: new Date(response?.data?.created),
		cpu: {
			total: response?.data?.cpu_limit?.max,
			used: response?.data?.cpu_limit?.used,
			staked: parseInt(response?.data?.cpu_weight, 10) / 1e8,
		},
		ram: {
			total: response?.data?.ram_quota,
			used: response?.data?.ram_usage,
		},
		net: {
			total: response?.data?.net_limit?.max,
			used: response?.data?.net_limit?.used,
			staked: response?.data?.net_weight / 1e8,
		},
	};
}

export async function fetchBalances(account: string): Promise<BalanceItem> {
	const [wax, tlm] = await Promise.all([fetchTokenBalance("eosio.token", account, "WAX"), fetchTokenBalance("alien.worlds", account, "TLM")]);

	return { tlm, wax };
}
