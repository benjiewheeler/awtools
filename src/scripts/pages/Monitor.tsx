import filesize from "filesize";
import _ from "lodash";
import React, { createRef, RefObject } from "react";
import ReactDOM from "react-dom";
import "../../style/monitor.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { AccountInfoItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { fetchAccountInfo } from "../util/utilities";
import { BasePage } from "./BasePage";

interface MonitorState {
	loading?: boolean;
	error?: boolean;
	errorText?: string;
	account?: string;
	info?: AccountInfoItem;
}

export class Monitor extends BasePage<unknown, MonitorState> {
	private readonly MAX_NO_REFRESH_DELAY = 20 * 60 * 1000;
	private refreshRef: RefObject<HTMLInputElement> = createRef();
	private fetchTimeout: number;
	private lastRefreshTime: number;

	constructor(props: unknown) {
		super(props);
		this.state = {};
		this.lastRefreshTime = 0;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		addEventListener(URLHashManager.ACCOUNT_CHANGE_EVENT, (e: CustomEvent<string>) => {
			if (!e.detail) {
				this.setState({ account: null });
				return;
			}
			this.forceRefresh(e.detail);
		});
	}

	componentDidMount(): void {
		const account = this.hashManager.getHashParam(URLHashManager.ACCOUNT_PARAM);

		if (account) {
			this.forceRefresh(account);
		}
	}

	getIntervalValue(type: "half" | "full"): number {
		const value = parseInt(this.refreshRef?.current?.value, 10) || 10;
		const interval = type == "full" ? value : value / 2;
		return Math.max(interval, 1) * 1e3;
	}

	async forceRefresh(account?: string): Promise<void> {
		this.lastRefreshTime = Date.now();
		this.fetchAccount(account || this.state?.account);
	}

	async fetchAccount(account: string): Promise<void> {
		if (this.lastRefreshTime !== 0) {
			const diff = Date.now() - this.lastRefreshTime;

			if (diff > this.MAX_NO_REFRESH_DELAY) {
				this.setState({ info: null, error: true, errorText: "Please refresh manually" });
				document.title = `WAX CPU: Paused`;
				return;
			}
		}

		window.clearTimeout(this.fetchTimeout);
		this.setState({ loading: true, error: false, errorText: null });

		try {
			await (async () => {
				const info = await fetchAccountInfo(account, true);
				this.setState({ info });

				document.title = `WAX CPU: ${_.round((info?.cpu?.used / info?.cpu?.total) * 100, 1)}%`;
			})();
		} catch (error) {
			this.setState({ loading: false, error: true, errorText: null });
			this.fetchTimeout = window.setTimeout(() => this.fetchAccount(account), this.getIntervalValue("half"));
			return;
		}

		this.setState({ loading: false, account });
		this.fetchTimeout = window.setTimeout(() => this.fetchAccount(account), this.getIntervalValue("full"));
	}

	formatCPU(micro = 0): string {
		const units = ["µs", "ms", "s"];

		const i = micro === 0 ? 0 : Math.min(2, Math.floor(Math.log10(micro) / Math.log10(1000)));
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
			<div className="page monitor">
				<Header title="WAX resource monitor" />
				<div className="body">
					<div className="visuals">
						{this.state?.loading && <div className="loading"></div>}
						{this.state?.error && <Error text={this.state?.errorText} />}
					</div>
					{this.state?.account && (
						<>
							<div className="controls">
								<label htmlFor="waxid">Refresh interval (seconds)</label>
								<input ref={this.refreshRef} type="number" defaultValue={10} min={1} max={600} className="refresh-field" />
								<input
									disabled={!this.state?.account}
									type="button"
									className="refresh-button"
									value="Refresh"
									onClick={() => this.forceRefresh()}
								/>
							</div>
							<div className="notice">
								<span>To avoid forgetting the monitor running for long times, the auto-refresh will stop after 20 minutes</span>
								<span>You must refresh manually once every 20 minutes to keep the monitor running</span>
							</div>
						</>
					)}
					{this.state?.account && this.state?.info && (
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
				</div>
				<Footer />
			</div>
		);
	}
}

(async () => {
	ReactDOM.render(<Monitor />, document.getElementById("root"));
})();
