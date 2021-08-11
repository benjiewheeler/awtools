import filesize from "filesize";
import _ from "lodash";
import React, { createRef, RefObject } from "react";
import ReactDOM from "react-dom";
import "../../assets/cpu_alarm.mp3";
import "../../style/monitor.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { AccountInfoItem, ChainInfoItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { fetchAccountInfo, fetchChainInfo } from "../util/utilities";
import { BasePage } from "./BasePage";

interface MonitorState {
	loading?: boolean;
	error?: boolean;
	errorText?: string;
	account?: string;
	accountInfo?: AccountInfoItem;
	chainInfo?: ChainInfoItem;
	titleType?: "cpu" | "chain";
	enableSound?: boolean;
}

export class Monitor extends BasePage<unknown, MonitorState> {
	private readonly MAX_NO_REFRESH_DELAY = 20 * 60 * 1000;
	private refreshRef: RefObject<HTMLInputElement> = createRef();
	private soundThresholdRef: RefObject<HTMLInputElement> = createRef();
	private fetchTimeout: number;
	private lastRefreshTime: number;

	constructor(props: unknown) {
		super(props);
		this.state = { titleType: "cpu" };
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

	setTitleType(titleType?: "cpu" | "chain"): void {
		this.setState({ titleType }, () => this.updateTitle());
	}

	setEnableSound(enabled: boolean): void {
		this.setState({ enableSound: enabled });
	}

	updateTitle(): void {
		document.title =
			this.state?.titleType === "cpu"
				? `Account CPU: ${_.round((this.state?.accountInfo?.cpu?.used / this.state?.accountInfo?.cpu?.total) * 100, 1)}%`
				: `Chain CPU: ${this.formatCPU(this.state?.chainInfo.virtualCPULimit)}`;
	}

	getIntervalValue(type: "half" | "full"): number {
		const value = parseInt(this.refreshRef?.current?.value, 10) || 10;
		const interval = type == "full" ? value : value / 2;
		return Math.max(interval, 1) * 1e3;
	}

	getSoundThresholdValue(): number {
		const value = parseInt(this.soundThresholdRef?.current?.value, 10) || 500;
		return value;
	}

	async forceRefresh(account?: string): Promise<void> {
		this.lastRefreshTime = Date.now();
		this.fetchAccount(account || this.state?.account);
	}

	async playNotification(): Promise<void> {
		const audio = new Audio("cpu_alarm.mp3");
		audio.autoplay = true;
		audio.load();
		audio.play();
		console.log("PLAYING SOUND");
	}

	async fetchAccount(account: string): Promise<void> {
		if (this.lastRefreshTime !== 0) {
			const diff = Date.now() - this.lastRefreshTime;

			if (diff > this.MAX_NO_REFRESH_DELAY) {
				this.setState({ accountInfo: null, chainInfo: null, error: true, errorText: "Please refresh manually" });
				document.title = `WAX CPU: Paused`;
				return;
			}
		}

		window.clearTimeout(this.fetchTimeout);
		this.setState({ loading: true, error: false, errorText: null });

		try {
			await (async () => {
				const [accountInfo, chainInfo] = await Promise.all([fetchAccountInfo(account, true), fetchChainInfo()]);
				this.setState({ accountInfo, chainInfo });

				document.title =
					this.state?.titleType === "cpu"
						? `Account CPU: ${_.round((accountInfo?.cpu?.used / accountInfo?.cpu?.total) * 100, 1)}%`
						: `Chain CPU: ${this.formatCPU(chainInfo.virtualCPULimit)}`;

				console.log({ enableSound: this.state?.enableSound, chainInfo, notificationThreshold: this.getSoundThresholdValue() });

				if (this.state?.enableSound && chainInfo.virtualCPULimit / 1e3 < this.getSoundThresholdValue()) {
					this.playNotification();
				}
			})();
		} catch (error) {
			this.setState({ loading: false, error: true, errorText: null });
			this.fetchTimeout = window.setTimeout(() => this.fetchAccount(this.state?.account), this.getIntervalValue("half"));
			return;
		}

		this.setState({ loading: false, account });
		this.fetchTimeout = window.setTimeout(() => this.fetchAccount(this.state?.account), this.getIntervalValue("full"));
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
								<div className="line">
									<label>Refresh interval (seconds)</label>
									<input ref={this.refreshRef} type="number" defaultValue={10} min={1} max={600} className="refresh-field" />
									<input
										disabled={!this.state?.account}
										type="button"
										className="refresh-button"
										value="Refresh"
										onClick={() => this.forceRefresh()}
									/>
								</div>
								<div className="line">
									<label className="label">Title</label>
									<label className="radio-label" htmlFor="title-radio-cpu">
										CPU
									</label>
									<input
										className="title-radio"
										id="title-radio-cpu"
										type="radio"
										name="title"
										value="Account CPU"
										defaultChecked={this.state?.titleType == "cpu"}
										onChange={() => this.setTitleType("cpu")}
									/>

									<label className="radio-label" htmlFor="title-radio-chain">
										Chain
									</label>
									<input
										className="title-radio"
										id="title-radio-chain"
										type="radio"
										name="title"
										value="Chain Limit"
										defaultChecked={this.state?.titleType == "chain"}
										onChange={() => this.setTitleType("chain")}
									/>
								</div>
								<div className="line">
									<label className="label">Notification</label>
									<label className="sound-label" htmlFor="sound-checkbox">
										Enable
									</label>
									<input
										className="sound-checkbox"
										id="sound-checkbox"
										type="checkbox"
										defaultChecked={this.state?.enableSound}
										onChange={e => this.setEnableSound(e.target.checked)}
									/>

									<label className="sound-label" htmlFor="sound-field">
										Threshold
									</label>

									<input
										ref={this.soundThresholdRef}
										className="sound-field"
										type="number"
										defaultValue={500}
										min={10}
										max={10000}
										step={10}
									/>
								</div>
							</div>
							<div className="notice">
								<span>To avoid forgetting the monitor running for long times, the auto-refresh will stop after 20 minutes</span>
								<span>You must refresh manually once every 20 minutes to keep the monitor running</span>
							</div>
						</>
					)}
					{this.state?.account && this.state?.accountInfo && (
						<div className="info">
							<div className="chain">
								<span className="title">
									Chain <span className="note">(Virtual Block CPU Limit)</span>
								</span>
								<div className="progress-bar">
									<div className="progress">{this.formatCPU(this.state?.chainInfo?.virtualCPULimit)}</div>
								</div>
							</div>
							<div className="ram">
								<span className="title">RAM</span>
								<div className="progress-bar">
									<div
										className="progress"
										style={{
											flexBasis: `${(this.state?.accountInfo?.ram?.used / this.state?.accountInfo?.ram?.total) * 100}%`,
										}}
									>
										{`${_.round((this.state?.accountInfo?.ram?.used / this.state?.accountInfo?.ram?.total) * 100, 1)}%`}
									</div>
								</div>
								<div className="details">
									<span className="used">{filesize(this.state?.accountInfo?.ram?.used || 0)}</span>
									<span className="total">{filesize(this.state?.accountInfo?.ram?.total || 0)}</span>
								</div>
							</div>
							<div className="cpu">
								<span className="title">CPU</span>
								<div className="progress-bar">
									<div
										className="progress"
										style={{
											flexBasis: `${(this.state?.accountInfo?.cpu?.used / this.state?.accountInfo?.cpu?.total) * 100}%`,
										}}
									>
										{`${_.round((this.state?.accountInfo?.cpu?.used / this.state?.accountInfo?.cpu?.total) * 100, 1)}%`}
									</div>
								</div>
								<div className="details">
									<span className="used">{this.formatCPU(this.state?.accountInfo?.cpu?.used)}</span>
									<span className="staked">
										{`${this.state?.accountInfo?.cpu?.staked?.toLocaleString("en", { maximumFractionDigits: 4 })} WAX`}
									</span>
									<span className="total">{this.formatCPU(this.state?.accountInfo?.cpu?.total)}</span>
								</div>
							</div>
							<div className="net">
								<span className="title">NET</span>
								<div className="progress-bar">
									<div
										className="progress"
										style={{
											flexBasis: `${(this.state?.accountInfo?.net?.used / this.state?.accountInfo?.net?.total) * 100}%`,
										}}
									>
										{`${_.round((this.state?.accountInfo?.net?.used / this.state?.accountInfo?.net?.total) * 100, 1)}%`}
									</div>
								</div>
								<div className="details">
									<span className="used">{filesize(this.state?.accountInfo?.net?.used || 0)}</span>
									<span className="staked">
										{`${this.state?.accountInfo?.net?.staked?.toLocaleString("en", { maximumFractionDigits: 4 })} WAX`}
									</span>
									<span className="total">{filesize(this.state?.accountInfo?.net?.total || 0)}</span>
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
