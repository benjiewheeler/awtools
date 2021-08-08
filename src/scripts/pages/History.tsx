import { ChartData, ChartOptions } from "chart.js";
import _ from "lodash";
import moment from "moment";
import React from "react";
import { Bar } from "react-chartjs-2";
import ReactDOM from "react-dom";
import "../../style/history.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MineHistoryItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { fetchMineHistory } from "../util/utilities";
import { BasePage } from "./BasePage";

interface HistoryState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	miningHistory?: MineHistoryItem[];
	chartData?: ChartData;
	chartOptions?: ChartOptions;
}

export class History extends BasePage<unknown, HistoryState> {
	constructor(props: unknown) {
		super(props);
		this.state = {
			chartOptions: {
				responsive: true,
				aspectRatio: 1.5,
				maintainAspectRatio: true,
				animation: {
					duration: 300,
				},
				scales: {
					x: {
						axis: "x",
						grid: { display: false },
					},
					y1: {
						axis: "y",
						grid: { display: false },
						ticks: {
							precision: 0,
							color: "#c4c44f",
						},
						beginAtZero: true,
						position: "right",
					},
					y2: {
						axis: "y",
						grid: { display: false },
						ticks: {
							precision: 4,
							color: "#4f90c4",
						},
						beginAtZero: true,
					},
				},
			},
		};

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
				if (this.state.miningHistory && account == this.state.account) {
					return;
				}
				const history = await fetchMineHistory(account);
				const chartData = _(history)
					.groupBy(l => new Date(l?.date)?.getHours())
					.mapValues((v, k) => ({ sum: _(v).sumBy(l => l.amount), count: v.length, hour: parseInt(k, 10) }));

				this.setState({
					miningHistory: history,
					chartData: {
						labels: _.range(24),
						datasets: [
							{
								yAxisID: "y1",
								xAxisID: "x",
								type: "line",
								backgroundColor: "#f3f320",
								data: chartData
									.values()
									.map(l => ({ x: l.hour, y: l.count }))
									.value(),
								label: "# of mines",
								tension: 0.1,
								borderColor: "#f3f320",
								borderWidth: 1,
							},
							{
								yAxisID: "y2",
								xAxisID: "x",
								type: "bar",
								backgroundColor: "#4f90c4",
								data: chartData
									.values()
									.map(l => ({ x: l.hour, y: l.sum }))
									.value(),
								label: "TLM",
							},
						],
					},
				});
			})();
		} catch (error) {
			this.setState({ loading: false, error: true });
			return;
		}

		this.setState({ loading: false, account });
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
			<div className="page history">
				<Header title="Alien Worlds Mining History" />
				<div className="body">
					{this.state.loading && <div className="loading"></div>}
					{this.state.error && <Error />}
					{!this.state.loading && !this.state.error && (
						<>
							{this.state.miningHistory && (
								<>
									<div className="chart">
										<h2 className="title">Chart</h2>
										<div className="holder">
											<div className="container">
												<Bar
													data={this.state?.chartData}
													options={this.state?.chartOptions}
													style={{ maxHeight: 500, maxWidth: 1000, minWidth: 340 }}
												/>
											</div>
										</div>
									</div>
									<div className="stats">
										<h2 className="title">Stats</h2>
										<div className="holder">
											<div className="total">
												<span className="title">Total TLM</span>
												<span className="value">
													{_.round(
														_(this.state?.miningHistory).sumBy(l => l.amount),
														4
													)}
												</span>
											</div>
											<div className="count">
												<span className="title">Mines</span>
												<span className="value">{this.state?.miningHistory?.length}</span>
											</div>
										</div>
									</div>
									<div className="history">
										<h2 className="title">Mining History</h2>
										<div className="holder">
											{this.state.miningHistory.map((dp, i) => (
												<div className="datapoint" key={`history-${i}`}>
													<span className="date">{moment(dp.date).format("DD MMM YYYY, HH:mm:ss zz")}</span>
													<span className="amount">{_.round(dp.amount, 4)}</span>
												</div>
											))}
										</div>
									</div>
								</>
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
	ReactDOM.render(<History />, document.getElementById("root"));
})();
