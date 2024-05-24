import async from "async";
import { ChartData, ChartOptions } from "chart.js";
import _ from "lodash";
import moment from "moment";
import React, { RefObject, createRef } from "react";
import { Bar } from "react-chartjs-2";
import ReactDOM from "react-dom";
import "../../style/history.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MineHistoryItem, MineHistoryTransactionItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { fetchMineHistory, fetchTransaction } from "../util/utilities";
import { BasePage } from "./BasePage";

interface HistoryState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	date?: Date;
	miningHistory?: MineHistoryItem[];
	chartData?: ChartData;
	chartOptions?: ChartOptions;
}

export class History extends BasePage<unknown, HistoryState> {
	private dateRef: RefObject<HTMLInputElement> = createRef();

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

			date: new Date(),
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
				// @ts-ignore
				const date = this.dateRef.current.value;
				const transactions = await fetchMineHistory(account, date);
				const history = await async.mapLimit<MineHistoryTransactionItem, MineHistoryItem>(
					transactions,
					8,
					async t => await fetchTransaction(t.trx_id)
				);
				const chartData = _(history)
					.groupBy(l => new Date(l?.date)?.getHours())
					.mapValues((v, k) => ({ sum: _(v).sumBy(l => l.amount), count: v.length, hour: parseInt(k, 10) }));

				// @ts-ignore
				if (date != this.dateRef.current.value) {
					return;
				}

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
			this.setState({ account, loading: false, error: true });
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

	calculateChange(current: number, previous: number): number {
		if (!previous) {
			return 0;
		}

		return current / previous - 1;
	}

	render(): JSX.Element {
		return (
			<div className="page history">
				<Header title="Alien Worlds Mining History" />
				<div className="body">
					{this.state.loading && <div className="loading"></div>}
					{this.state.error && <Error />}
					<div className="controls">
						<div className="line">
							<label>Date</label>
							<input
								ref={this.dateRef}
								type="date"
								defaultValue={this.state?.date?.toISOString().split("T")[0]}
								className="date-field"
								onChange={e =>
									// @ts-ignore
									this.fetchAccount(this.state?.account) && this.setState({ date: new Date(e.target.value || Date.now()) })
								}
							/>
						</div>
					</div>
					{!this.state.loading && !this.state.error && (
						<>
							{this.state.miningHistory && (
								<>
									<div className="chart">
										<h2 className="title">Chart</h2>
										<div className="holder">
											<div className="container">
												<Bar
													// @ts-ignore
													data={this.state?.chartData}
													// @ts-ignore
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
													{_.round(_(this.state?.miningHistory).sumBy(l => l.amount) || 0, 4)}
												</span>
											</div>
											<div className="count">
												<span className="title">Mines</span>
												<span className="value">{this.state?.miningHistory?.length || 0}</span>
											</div>
											<div className="average">
												<span className="title">Average</span>
												<span className="value">
													{_.round(
														_(this.state?.miningHistory)
															.map(l => l.amount)
															.mean() || 0,
														4
													)}
												</span>
											</div>
											<div className="largest">
												<span className="title">Largest</span>
												<span className="value">
													{_.round(
														_(this.state?.miningHistory)
															.map(l => l.amount)
															.max() || 0,
														4
													)}
												</span>
											</div>
										</div>
									</div>
									<div className="history">
										<h2 className="title">Mining History</h2>
										<div className="holder">
											{this.state.miningHistory.map((dp, i, list) => (
												<div className="datapoint" key={`history-${i}`}>
													<span className="date">{moment(dp.date).format("DD MMM YYYY, HH:mm:ss zz")}</span>
													<span className="amount">{dp?.amount?.toFixed(4)}</span>
													<span
														className={`change ${
															this.calculateChange(dp.amount, list[i + 1]?.amount) > 0
																? "positive"
																: this.calculateChange(dp.amount, list[i + 1]?.amount) < 0
																? "negative"
																: ""
														}`}
													>
														{this.calculateChange(dp.amount, list[i + 1]?.amount) > 0 ? "+" : ""}
														{this.calculateChange(dp.amount, list[i + 1]?.amount).toLocaleString("en", {
															style: "percent",
															maximumFractionDigits: 2,
															minimumFractionDigits: 2,
														})}
													</span>
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
