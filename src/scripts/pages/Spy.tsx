import _ from "lodash";
import React, { createRef, RefObject } from "react";
import ReactDOM from "react-dom";
import "../../style/spy.less";
import { Error } from "../components/Error";
import { Header } from "../components/Header";
import { AccountInfoItem, BalanceItem, MineHistoryItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { fetchAccountInfo, fetchBalances, fetchMineHistory } from "../util/utilities";
import { BasePage } from "./BasePage";
import filesize from "filesize";

interface SpyState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	balances?: BalanceItem;
	miningHistory?: MineHistoryItem[];
	info?: AccountInfoItem;
}

export class Spy extends BasePage<unknown, SpyState> {
	private accountRef: RefObject<HTMLInputElement> = createRef();

	constructor(props: unknown) {
		super(props);
		this.state = { miningHistory: [] };

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

	selectAccount(): void {
		const account = this.accountRef.current.value.trim().toLowerCase();

		this.hashManager.setHashParam(URLHashManager.ACCOUNT_PARAM, account);
	}

	async fetchAccount(account: string): Promise<void> {
		this.accountRef.current.value = account;

		try {
			this.setState({ loading: true, error: false });

			const balances = await fetchBalances(account);
			const history = await fetchMineHistory(account);
			const info = await fetchAccountInfo(account);

			this.setState({ loading: false, account, balances, info, miningHistory: history });
		} catch (error) {
			this.setState({ loading: false, error: true });
		}
	}

	formatCPU(micro = 0): string {
		const units = ["µs", "ms", "s"];

		const i = Math.min(2, Math.floor(Math.log10(micro) / Math.log10(1000)));
		const result = micro / Math.pow(1000, i);

		return `${result.toLocaleString("en", { maximumFractionDigits: 2 })} ${units[i]}`;
	}

	render(): JSX.Element {
		return (
			<div className="page spy">
				<Header />
				<div className="body">
					<div className="controls">
						<label htmlFor="waxid">Account</label>
						<input
							ref={this.accountRef}
							autoComplete="off"
							type="text"
							id="waxid"
							className="waxid"
							placeholder="monke.wam"
							onKeyPress={e => e.key == "Enter" && this.selectAccount()}
						/>
						<input type="button" className="select" value="Select" onClick={() => this.selectAccount()} />
					</div>
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
							{this.state.miningHistory && (
								<div className="history">
									<h2 className="title">Mining History</h2>
									<div className="holder">
										{this.state.miningHistory.map((dp, i) => (
											<div className="datapoint" key={`history-${i}`}>
												<span className="date">{dp.date.toLocaleString()}</span>
												<span className="amount">{_.round(dp.amount, 4)}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		);
	}
}

(async () => {
	ReactDOM.render(<Spy />, document.getElementById("root"));
})();
