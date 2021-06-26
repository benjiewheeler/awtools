import G from "generatorics";
import _ from "lodash";
import React, { createRef, RefObject } from "react";
import ReactDOM from "react-dom";
import "../../style/builder.less";
import { Error } from "../components/Error";
import { Header } from "../components/Header";
import { InventoryTool, ToolItem } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { calculateToolsDelay, calculateToolsLuck, calculateToolsPower, findTool, getInventory } from "../util/utilities";
import { BasePage } from "./BasePage";

interface BuilderState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	inventory?: InventoryTool[];
	builds?: ToolItem[][];
}

export class Spy extends BasePage<unknown, BuilderState> {
	private accountRef: RefObject<HTMLInputElement> = createRef();

	constructor(props: unknown) {
		super(props);
		this.state = { builds: [], inventory: [] };

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

			const inventory = await getInventory(account);

			const tools = _(inventory)
				.map<InventoryTool>(t => ({ tool: findTool(t.template), count: t.count }))
				.filter(t => !_.isNil(t.tool))
				.flattenDeep()
				.value();

			this.setState({ loading: false, account, inventory: tools });

			const toolTemplates = _(tools)
				.mapKeys(t => t.tool.template)
				.mapValues(t => Math.min(3, t.count))
				.value();

			const powerSetInput = _(toolTemplates)
				.map((v, k) => Array(v).fill(k))
				.flatten()
				.value();

			console.log({ toolTemplates, powerSetInput });

			const perms: string[] = [];
			const set: Generator<string[]> = G.powerSet(powerSetInput, 3);

			for (const perm of set) {
				if (perm.length > 0 && perm.length <= 3) {
					const combo = perm.sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).join(",");
					perms.push(combo);
				}
			}

			console.log({ perms });

			const builds = _(perms)
				.uniq()
				.sortBy()
				.map(combo => combo.split(","))
				.map(set => set.map(t => findTool(t)))
				.orderBy([tools => tools.length], ["desc"])
				.value();

			console.log({ builds });

			this.setState({ builds });
		} catch (error) {
			this.setState({ loading: false, error: true });
		}
	}

	render(): JSX.Element {
		return (
			<div className="page builder">
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
							<div className="inventory">
								<h2 className="title">Inventory</h2>
								<div className="holder">
									{this.state.inventory.map(t => (
										<div className="tool" key={`inventory-${t?.tool?.template}`}>
											<img src={`https://cloudflare-ipfs.com/ipfs/${t.tool.img}`} className="card" />
											{/* <img className="card" /> */}
											<div className="info">
												<span className="name">{t?.tool?.name}</span>
												<span className="count">{t?.count}</span>
											</div>
										</div>
									))}
								</div>
							</div>
							<div className="builds">
								<h2 className="title">
									Possible Builds <span className="note">(Ordered by TLM/Min descending)</span>
								</h2>
								<div className="holder">
									{this.state.builds
										.map(tools => ({
											tools,
											stats: {
												power: calculateToolsPower(tools),
												luck: calculateToolsLuck(tools),
												delay: calculateToolsDelay(tools),
											},
										}))
										.sort((a, b) => b.stats.power / b.stats.delay - a.stats.power / a.stats.delay)
										.map(({ tools, stats }) => (
											<div className="build" key={tools.map(t => t.template).join(",")}>
												<div className="tools">
													{tools.map((tool, i) => (
														<div className="tool" key={`build-${i}-${tool.template}`}>
															<div className="info">
																<span className="name">{`${tool.name} (${tool.shine})`}</span>
															</div>
														</div>
													))}
												</div>
												<div className="stats">
													<span className="power">{_.round(stats.power, 2)}</span>
													<span className="luck">{_.round(stats.luck, 2)}</span>
													<span className="delay">{_.round(stats.delay, 2)}</span>
													<span className="tlm-min">{_.round(stats.power / (stats.delay / 60), 3)}</span>
													<span className="luck-min">{_.round(stats.luck / (stats.delay / 60), 3)}</span>
												</div>
											</div>
										))}
								</div>
							</div>
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
