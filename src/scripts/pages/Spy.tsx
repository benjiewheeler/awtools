import filesize from "filesize";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import "../../style/spy.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { AccountInfoItem, BalanceItem, LandItem, MineHistoryItem, ToolItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import {
	calculateToolsDelay,
	calculateToolsLuck,
	calculateToolsPower,
	fetchAccountInfo,
	fetchBag,
	fetchBalances,
	fetchLand,
	fetchMineHistory,
} from "../util/utilities";
import { BasePage } from "./BasePage";

interface SpyState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	balances?: BalanceItem;
	miningHistory?: MineHistoryItem[];
	info?: AccountInfoItem;
	bag?: ToolItem[];
	land?: LandItem;
}

export class Spy extends BasePage<unknown, SpyState> {
	constructor(props: unknown) {
		super(props);
		this.state = {};

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		addEventListener(URLHashManager.ACCOUNT_CHANGE_EVENT, (e: CustomEvent<string>) => {
			this.fetchAccount(e.detail);
		});
	}

	componentDidMount(): void {
		const account = this.hashManager.getHashParam(URLHashManager.ACCOUNT_PARAM);

		if (account) {
			this.fetchAccount(account);
		}
	}

	async fetchAccount(account: string): Promise<void> {
		this.setState({ loading: true, error: false });

		try {
			await (async () => {
				if (this.state.bag && account == this.state.account) {
					return;
				}
				const bag = await fetchBag(account);
				this.setState({ bag });
			})();
		} catch (error) {
			this.setState({ loading: false, error: true });
			return;
		}

		try {
			await (async () => {
				if (this.state.land && account == this.state.account) {
					return;
				}
				const land = await fetchLand(account);
				this.setState({ land });
			})();
		} catch (error) {
			this.setState({ loading: false, error: true });
			return;
		}

		try {
			await (async () => {
				if (this.state.balances && account == this.state.account) {
					return;
				}
				const balances = await fetchBalances(account);
				this.setState({ balances });
			})();
		} catch (error) {
			this.setState({ loading: false, error: true });
			return;
		}

		try {
			await (async () => {
				if (this.state.miningHistory && account == this.state.account) {
					return;
				}
				const history = await fetchMineHistory(account);
				this.setState({ miningHistory: history });
			})();
		} catch (error) {
			this.setState({ loading: false, error: true });
			return;
		}

		try {
			await (async () => {
				if (this.state.info && account == this.state.account) {
					return;
				}
				const info = await fetchAccountInfo(account);
				this.setState({ info });
			})();
		} catch (error) {
			this.setState({ loading: false, error: true });
			return;
		}

		this.setState({ loading: false, account });
	}

	formatCPU(micro = 0): string {
		const units = ["µs", "ms", "s"];

		const i = Math.min(2, Math.floor(Math.log10(micro) / Math.log10(1000)));
		const result = micro / Math.pow(1000, i);

		return `${result.toLocaleString("en", { maximumFractionDigits: 2 })} ${units[i]}`;
	}

	formatTime(seconds: number): string {
		if (seconds < 0) {
			return "00:00:00";
		}

		const units = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), Math.floor((seconds % 3600) % 60)];

		if (seconds < 3600) {
			units.shift();
		}

		return units.map(n => n.toString().padStart(2, "0")).join(":");
	}

	render(): JSX.Element {
		return (
			<div className="page spy">
				<Header title="Alien Worlds spy" />
				<div className="body">
					{this.state.loading && <div className="loading"></div>}
					{this.state.error && <Error />}
					{!this.state.loading && !this.state.error && (
						<>
							{this.state.balances && (
								<div className="balances">
									<div className="wax">
										<span className="amount">{_.round(this.state?.balances?.wax || 0, 4)}</span>
									</div>
									<div className="tlm">
										<span className="amount">{_.round(this.state?.balances?.tlm || 0, 4)}</span>
									</div>
								</div>
							)}
							{this.state.info && (
								<div className="info">
									<div className="ram">
										<span className="title">RAM</span>
										<div className="progress-bar">
											<div
												className="progress"
												style={{ flexBasis: `${(this.state?.info?.ram?.used / this.state?.info?.ram?.total) * 100}%` }}
											>
												{`${_.round((this.state?.info?.ram?.used / this.state?.info?.ram?.total) * 100, 1)}%`}
											</div>
										</div>
										<div className="details">
											<span className="used">{filesize(this.state?.info?.ram?.used || 0)}</span>
											<span className="total">{filesize(this.state?.info?.ram?.total || 0)}</span>
										</div>
									</div>
									<div className="cpu">
										<span className="title">CPU</span>
										<div className="progress-bar">
											<div
												className="progress"
												style={{ flexBasis: `${(this.state?.info?.cpu?.used / this.state?.info?.cpu?.total) * 100}%` }}
											>
												{`${_.round((this.state?.info?.cpu?.used / this.state?.info?.cpu?.total) * 100, 1)}%`}
											</div>
										</div>
										<div className="details">
											<span className="used">{this.formatCPU(this.state?.info?.cpu?.used)}</span>
											<span className="staked">
												{`${this.state?.info?.cpu?.staked?.toLocaleString("en", { maximumFractionDigits: 4 })} WAX`}
											</span>
											<span className="total">{this.formatCPU(this.state?.info?.cpu?.total)}</span>
										</div>
									</div>
									<div className="net">
										<span className="title">NET</span>
										<div className="progress-bar">
											<div
												className="progress"
												style={{ flexBasis: `${(this.state?.info?.net?.used / this.state?.info?.net?.total) * 100}%` }}
											>
												{`${_.round((this.state?.info?.net?.used / this.state?.info?.net?.total) * 100, 1)}%`}
											</div>
										</div>
										<div className="details">
											<span className="used">{filesize(this.state?.info?.net?.used || 0)}</span>
											<span className="staked">
												{`${this.state?.info?.net?.staked?.toLocaleString("en", { maximumFractionDigits: 4 })} WAX`}
											</span>
											<span className="total">{filesize(this.state?.info?.net?.total || 0)}</span>
										</div>
									</div>
								</div>
							)}
							{this.state?.land && this.state?.bag && (
								<div className="setup">
									<h2 className="title">Setup</h2>
									<div className="holder">
										<div className="charge">
											<span className="title">Charge Time</span>
											<span className="value">
												{this.formatTime(calculateToolsDelay(this.state?.bag) * this.state?.land?.delay)}
											</span>
										</div>
										<div className="power">
											<span className="title">Mining Power</span>
											<span className="value">
												{((calculateToolsPower(this.state?.bag) * this.state?.land?.power) / 100).toLocaleString("en", {
													style: "percent",
													maximumFractionDigits: 2,
												})}
											</span>
										</div>
										<div className="luck">
											<span className="title">NFT Luck</span>
											<span className="value">
												{((calculateToolsLuck(this.state?.bag) * this.state?.land?.luck) / 100).toLocaleString("en", {
													style: "percent",
													maximumFractionDigits: 2,
												})}
											</span>
										</div>
									</div>
								</div>
							)}
							{this.state.bag && (
								<div className="bag">
									<h2 className="title">Bag</h2>
									<div className="holder">
										{this.state.bag.map(t => (
											<div className="tool" key={`bag-${t?.asset}`}>
												<img src={`https://cloudflare-ipfs.com/ipfs/${t.img}`} className="card" />
												<div className="info">
													<span className="name">{t?.name}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
							{this.state.land && (
								<div className="land">
									<h2 className="title">Land</h2>
									<div className="holder">
										<div className="land" key={`land-${this.state.land?.asset}`}>
											<img src={`https://cloudflare-ipfs.com/ipfs/${this.state.land?.img}`} className="card" />
											<div className="info">
												<span className="name">{this.state.land?.name}</span>
												<span className="planet">{`${this.state.land?.planet} (${this.state.land?.coordinates})`}</span>
											</div>
										</div>
									</div>
								</div>
							)}
							{this.state.miningHistory && (
								<div className="history">
									<h2 className="title">Mining History</h2>
									<div className="holder">
										{this.state.miningHistory.map((dp, i) => (
											<div className="datapoint" key={`history-${i}`}>
												<span className="date">
													{dp.date.toLocaleString("en-gb", {
														day: "2-digit",
														hour: "2-digit",
														hour12: false,
														minute: "2-digit",
														month: "short",
														second: "2-digit",
														timeZoneName: "short",
														year: "numeric",
													})}
												</span>
												<span className="amount">{_.round(dp.amount, 4)}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</>
					)}
				</div>
				<Footer />
			</div>
		);
	}
}

(async () => {
	ReactDOM.render(<Spy />, document.getElementById("root"));
})();
