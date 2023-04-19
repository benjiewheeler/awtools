import async from "async";
import axios from "axios";
import _ from "lodash";
import awlands from "../../assets/awlands.json";
import awtools from "../../assets/awtools.json";
import "../../style/builder.less";
import {
	AccountBagResponse,
	AccountInfoItem,
	AccountInfoResponse,
	AccountMinersResponse,
	AssetInfoResponse,
	BalanceItem,
	CacheObject,
	ChainInfoItem,
	ChainInfoResponse,
	InventoryAssetItem,
	InventoryAssetsResponse,
	InventoryTemplateItem,
	InventoryTemplatesResponse,
	InventoryValueResponse,
	LandItem,
	MineHistoryItem,
	MineHistoryResponse,
	MineHistoryTransactionItem,
	ToolItem,
	TransactionHistoryResponse,
} from "../types/types";

const ASSETS_PER_PAGE = 300;

const ENDPOINTS = {
	get_actions: [
		//
		"https://apiwax.3dkrender.com",
		"https://api.wax.alohaeos.com",
		"https://hyperion.wax.blacklusion.io",
		"https://wax.blokcrafters.io",
		"https://hyperion-wax-mainnet.wecan.dev",
		"https://wax.cryptolions.io",
		"https://wax.eosdublin.io",
		"https://wax.eosphere.io",
		"https://api.wax.greeneosio.com",
		"https://waxapi.ledgerwise.io",
		"https://hyperion.wax.tgg.gg",
		"https://api.waxeastern.cn",
		"https://wax-api.eosiomadrid.io",
		"https://wax-hyperion.wizardsguild.one",
	],
	get_account: [
		//
		"https://api.wax.alohaeos.com",
		"https://wax.blacklusion.io",
		"https://wax.blokcrafters.io",
		"https://api.wax.bountyblok.io",
		"https://wax.cryptolions.io",
		"https://wax.eosdac.io",
		"https://wax-api.eosiomadrid.io",
		"https://wax.eosn.io",
		"https://wax.api.eosnation.io",
		"https://wax.eosphere.io",
		"https://wax.eosusa.io",
		"https://api.wax.greeneosio.com",
		"https://wax.pink.gg",
		"https://api.waxsweden.org",
		"https://api.wax.liquidstudios.io",
		"https://wax-bp.wizardsguild.one",
		"https://wax.dapplica.io",
		"https://wax.eoseoul.io",
	],
	get_info: [
		//
		"https://api.wax.alohaeos.com",
		"https://wax.blacklusion.io",
		"https://wax.blokcrafters.io",
		"https://api.wax.bountyblok.io",
		"https://wax.cryptolions.io",
		"https://wax.eosdac.io",
		"https://wax-api.eosiomadrid.io",
		"https://wax.eosn.io",
		"https://wax.api.eosnation.io",
		"https://wax.eosphere.io",
		"https://wax.eosusa.io",
		"https://api.wax.greeneosio.com",
		"https://wax.pink.gg",
		"https://api.waxsweden.org",
	],
	get_currency_balance: [
		//
		"https://api.wax.alohaeos.com",
		"https://wax.blacklusion.io",
		"https://wax.blokcrafters.io",
		"https://api.wax.bountyblok.io",
		"https://wax.cryptolions.io",
		"https://wax.eosdac.io",
		"https://wax-api.eosiomadrid.io",
		"https://wax.eosn.io",
		"https://wax.api.eosnation.io",
		"https://wax.eosphere.io",
		"https://wax.eosusa.io",
		"https://api.wax.greeneosio.com",
		"https://wax.pink.gg",
		"https://api.waxsweden.org",
	],
	get_table_rows: [
		//
		"https://api.wax.alohaeos.com",
		"https://wax.blacklusion.io",
		"https://wax.blokcrafters.io",
		"https://api.wax.bountyblok.io",
		"https://wax.cryptolions.io",
		"https://wax.eosdac.io",
		"https://wax-api.eosiomadrid.io",
		"https://wax.eosn.io",
		"https://wax.api.eosnation.io",
		"https://wax.eosphere.io",
		"https://wax.eosusa.io",
		"https://api.wax.greeneosio.com",
		"https://wax.pink.gg",
		"https://api.waxsweden.org",
	],
};

export async function fetchToolAsset(asset: string): Promise<ToolItem> {
	const key = `asset_${asset}`;
	const cache = getStorageItem<ToolItem>(key);
	if (cache) {
		return cache;
	}
	const url = `https://wax.api.atomicassets.io/atomicassets/v1/assets/${asset}`;
	const response = await axios.get<AssetInfoResponse>(url, { timeout: 10e3 });

	const tool = findTool(response?.data?.data?.template.template_id, asset);
	setStorageItem(key, tool, 3600);
	return tool;
}

export async function getInventoryTemplates(account: string): Promise<InventoryTemplateItem[]> {
	const key = `inventory_templates_${account}`;
	const cache = getStorageItem<InventoryTemplateItem[]>(key);
	if (cache) {
		return cache;
	}

	const url = `https://wax.api.atomicassets.io/atomicassets/v1/accounts/${account}/alien.worlds`;
	const response = await axios.get<InventoryTemplatesResponse>(url, { timeout: 10e3 });

	const templates = response?.data?.data?.templates?.map(t => ({
		template: t.template_id,
		count: parseInt(t.assets),
	}));

	setStorageItem(key, templates, 300);
	return templates;
}

async function fetchInventoryAssetsPage(account: string, page = 1): Promise<InventoryAssetItem[]> {
	if (!account?.trim()?.length) {
		return [];
	}

	const key = `inventory_assets_${account}_page_${page}`;
	const cache = getStorageItem<InventoryAssetItem[]>(key);
	if (cache) {
		return cache;
	}

	const url = `https://wax.api.atomicassets.io/atomicassets/v1/assets`;
	const response = await axios.get<InventoryAssetsResponse>(url, {
		params: {
			owner: account,
			collection_name: "alien.worlds",
			schema_name: "tool.worlds",
			page,
			limit: ASSETS_PER_PAGE,
			order: "desc",
			sort: "transferred",
		},
		timeout: 10e3,
	});

	const assets = response?.data?.data?.map(a => ({
		asset: a.asset_id,
		template: a.template.template_id,
	}));

	setStorageItem(key, assets, 300);
	return assets;
}

export async function getInventoryAssets(account: string): Promise<InventoryAssetItem[]> {
	let page = 1;
	const assets: InventoryAssetItem[] = [];
	const cond = true;

	while (cond) {
		const assetsPage = await fetchInventoryAssetsPage(account, page);

		assetsPage?.forEach(a => assets.push(a));
		page++;

		if (assetsPage?.length < ASSETS_PER_PAGE) {
			break;
		}
	}

	return assets;
}

export function findTool(template: string, asset?: string): ToolItem {
	for (let i = 0; i < awtools.length; i++) {
		if (awtools[i].template === template) {
			return { ...awtools[i], asset };
		}
	}
	return null;
}

export function findLand(asset?: string): LandItem {
	for (let i = 0; i < awlands.length; i++) {
		if (awlands[i].asset === asset) {
			return awlands[i];
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

export async function fetchMineHistory(account: string, date: string): Promise<MineHistoryTransactionItem[]> {
	const key = `history_${account}_${date}`;
	const cache = getStorageItem<MineHistoryTransactionItem[]>(key);

	if (cache) {
		return cache;
	}

	const endpoint = _.sample(ENDPOINTS.get_actions);
	const url = `${endpoint}/v2/history/get_actions`;

	const dayStart = new Date(date);
	dayStart.setHours(0);
	dayStart.setMinutes(0);
	dayStart.setSeconds(0);
	dayStart.setMilliseconds(0);

	const dayEnd = new Date(dayStart.getTime() + 864e5 - 1);

	const response = await axios.get<MineHistoryResponse>(url, {
		params: {
			account: account,
			filter: "m.federation:mine",
			skip: 0,
			limit: 500,
			sort: "desc",
			after: dayStart.toISOString(),
			before: dayEnd.toISOString(),
		},
		timeout: 10e3,
	});

	const history = response?.data?.actions?.filter(m => m.act.name === "mine")?.map(m => ({ trx_id: m?.trx_id }));

	setStorageItem(key, history, Date.now() - dayStart.getTime() > 864e5 ? 3600 : 10);
	return history;
}

export async function fetchTransaction(txid: string): Promise<MineHistoryItem> {
	const key = `history_${txid?.slice(0, 16)}`;
	const cache = getStorageItem<MineHistoryItem>(key);
	console.log("fetchTransaction", { key, cache });

	if (cache) {
		return cache;
	}

	const endpoint = _.sample(ENDPOINTS.get_actions);
	const url = `${endpoint}/v2/history/get_transaction`;

	const response = await axios.get<TransactionHistoryResponse>(url, { params: { id: txid }, timeout: 10e3 });

	const notification = response?.data?.actions?.find(a => a.act.account == "notify.world" && a.act.name == "logmine");
	const data = (notification?.act?.data as any)?.data || notification?.act?.data;

	const history: MineHistoryItem = {
		date: new Date(notification?.timestamp),
		amount: parseFloat(data?.bounty),
	};

	if (history.amount) setStorageItem(key, history);
	return history;
}

export async function fetchInventoryValue(account: string): Promise<number> {
	const key = `inventory_value_${account}`;
	const cache = getStorageItem<number>(key);
	if (cache) {
		return cache;
	}

	const url = `https://wax.api.atomicassets.io/atomicmarket/v1/prices/assets`;
	const response = await axios.get<InventoryValueResponse>(url, {
		params: { owner: account, collection_name: "alien.worlds", schema_name: "tool.worlds" },
		timeout: 10e3,
	});

	const apiData = response?.data?.data[0];

	const data = parseInt(apiData?.suggested_median, 10) / Math.pow(10, apiData?.token_precision);
	setStorageItem(key, data, 600);
	return data;
}

export async function fetchTokenBalance(code: string, account: string, symbol: string): Promise<number> {
	const endpoint = _.sample(ENDPOINTS.get_currency_balance);
	const url = `${endpoint}/v1/chain/get_currency_balance`;
	const response = await axios.post<string[]>(url, { code, account, symbol }, { timeout: 10e3 });

	return parseFloat(response?.data?.pop());
}

export async function fetchAccountInfo(account: string, forceFetch = false): Promise<AccountInfoItem> {
	const key = `info_${account}`;

	if (!forceFetch) {
		const cache = getStorageItem<AccountInfoItem>(key);
		if (cache) {
			return cache;
		}
	}

	const endpoint = _.sample(ENDPOINTS.get_account);
	const url = `${endpoint}/v1/chain/get_account`;
	const response = await axios.post<AccountInfoResponse>(url, { account_name: account }, { timeout: 10e3 });

	const info = {
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
	setStorageItem(key, info, 60);
	return info;
}

export async function fetchChainInfo(): Promise<ChainInfoItem> {
	const endpoint = _.sample(ENDPOINTS.get_info);
	const url = `${endpoint}/v1/chain/get_info`;
	const response = await axios.post<ChainInfoResponse>(url, {}, { timeout: 10e3 });

	const info: ChainInfoItem = {
		virtualCPULimit: response?.data?.virtual_block_cpu_limit,
	};

	return info;
}

export async function fetchBalances(account: string): Promise<BalanceItem> {
	const key = `balances_${account}`;
	const cache = getStorageItem<BalanceItem>(key);
	if (cache) {
		return cache;
	}

	const [wax, tlm] = await Promise.all([fetchTokenBalance("eosio.token", account, "WAX"), fetchTokenBalance("alien.worlds", account, "TLM")]);

	const balances = { tlm, wax };
	setStorageItem(key, balances, 60);
	return balances;
}

export async function fetchBag(account: string): Promise<ToolItem[]> {
	const key = `bag_${account}`;
	const cache = getStorageItem<ToolItem[]>(key);
	if (cache) {
		return cache;
	}

	const endpoint = _.sample(ENDPOINTS.get_table_rows);
	const url = `${endpoint}/v1/chain/get_table_rows`;
	const response = await axios.post<AccountBagResponse>(
		url,
		{
			code: "m.federation",
			json: true,
			limit: 10,
			lower_bound: account,
			scope: "m.federation",
			table: "bags",
			upper_bound: account,
		},
		{ timeout: 10e3 }
	);
	const tools = await async.map<string, ToolItem>(response?.data?.rows[0].items, async a => await fetchToolAsset(a));
	setStorageItem(key, tools, 300);
	return tools;
}

export async function fetchLand(account: string): Promise<LandItem> {
	const key = `land_${account}`;
	const cache = getStorageItem<LandItem>(key);
	if (cache) {
		return cache;
	}

	const endpoint = _.sample(ENDPOINTS.get_table_rows);
	const url = `${endpoint}/v1/chain/get_table_rows`;
	const response = await axios.post<AccountMinersResponse>(
		url,
		{
			code: "m.federation",
			json: true,
			limit: 10,
			lower_bound: account,
			scope: "m.federation",
			table: "miners",
			upper_bound: account,
		},
		{ timeout: 10e3 }
	);

	const land = findLand(response?.data?.rows[0]?.current_land);
	setStorageItem(key, land, 300);
	return land;
}

function setStorageItem<T>(key: string, value: T, expiration: number = null): void {
	try {
		const obj: CacheObject<T> = { value, expiration: null };
		if (expiration) {
			obj.expiration = Date.now() + expiration * 1e3;
		}
		localStorage.setItem(key, JSON.stringify(obj));
	} catch (error) {
		localStorage.clear();
	}
}

function getStorageItem<T>(key: string, defaultValue?: T): T {
	try {
		const json = localStorage.getItem(key);
		const obj: CacheObject<T> = JSON.parse(json);
		if (obj?.expiration && obj?.expiration < Date.now()) {
			return defaultValue;
		}
		if (obj?.value === null || obj?.value === undefined) {
			return defaultValue;
		}
		return obj.value;
	} catch (error) {
		return defaultValue;
	}
}
