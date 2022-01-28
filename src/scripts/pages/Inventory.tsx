import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import "../../style/inventory.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { InventoryTool } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { fetchInventoryValue, findTool, getInventoryTemplates } from "../util/utilities";
import { BasePage } from "./BasePage";

interface InventoryState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	inventory?: InventoryTool[];
	value?: number;
}

export class Inventory extends BasePage<unknown, InventoryState> {
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
		try {
			this.setState({ loading: true, error: false });

			const inventory = await getInventoryTemplates(account);
			const value = await fetchInventoryValue(account);

			const tools = _(inventory)
				.map<InventoryTool>(t => ({ tool: findTool(t.template), count: t.count }))
				.filter(t => !_.isNil(t.tool))
				.flattenDeep()
				.orderBy([t => t.count], ["desc"])
				.value();

			this.setState({ loading: false, account, inventory: tools, value });
		} catch (error) {
			this.setState({ loading: false, error: true });
		}
	}

	render(): JSX.Element {
		return (
			<div className="page inventory">
				<Header title="Alien Worlds tools inventory" />
				<div className="body">
					{this.state.loading && <div className="loading"></div>}
					{this.state.error && <Error />}
					{this.state.inventory && !this.state.loading && !this.state.error && (
						<>
							<div className="inventory">
								<h2 className="title">Inventory</h2>
								<span className="value">{`Estimated Value: ${this.state?.value.toLocaleString("en", {
									maximumFractionDigits: 2,
									maximumSignificantDigits: 6,
								})} WAX`}</span>
								<div className="holder">
									{this.state.inventory?.map(t => (
										<div className="tool" key={`inventory-${t?.tool?.template}`}>
											<img src={`https://ipfs.hivebp.io/thumbnail?hash=${t.tool.img}`} className="card" />
											<div className="info">
												<span className="name">{t?.tool?.name}</span>
												<span className="count">{t?.count}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</div>
				<Footer />
			</div>
		);
	}
}

(async () => {
	ReactDOM.render(<Inventory />, document.getElementById("root"));
})();
