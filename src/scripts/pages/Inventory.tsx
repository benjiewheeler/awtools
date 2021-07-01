import _ from "lodash";
import React, { createRef, RefObject } from "react";
import ReactDOM from "react-dom";
import "../../style/inventory.less";
import { Error } from "../components/Error";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { InventoryTool } from "../types/types";
import { URLHashManager } from "../util/URLHashManager";
import { findTool, getInventoryTemplates } from "../util/utilities";
import { BasePage } from "./BasePage";

interface InventoryState {
	loading?: boolean;
	error?: boolean;
	account?: string;
	inventory?: InventoryTool[];
}

export class Inventory extends BasePage<unknown, InventoryState> {
	private accountRef: RefObject<HTMLInputElement> = createRef();

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

	selectAccount(): void {
		const account = this.accountRef.current.value.trim().toLowerCase();

		this.hashManager.setHashParam(URLHashManager.ACCOUNT_PARAM, account);
	}

	async fetchAccount(account: string): Promise<void> {
		this.accountRef.current.value = account;

		try {
			this.setState({ loading: true, error: false });

			const inventory = await getInventoryTemplates(account);

			const tools = _(inventory)
				.map<InventoryTool>(t => ({ tool: findTool(t.template), count: t.count }))
				.filter(t => !_.isNil(t.tool))
				.flattenDeep()
				.orderBy([t => t.count], ["desc"])
				.value();

			this.setState({ loading: false, account, inventory: tools });
		} catch (error) {
			this.setState({ loading: false, error: true });
		}
	}

	render(): JSX.Element {
		return (
			<div className="page inventory">
				<Header title="Alien Worlds tools inventory" />
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
					{this.state.inventory && !this.state.loading && !this.state.error && (
						<>
							<div className="inventory">
								<h2 className="title">Inventory</h2>
								<div className="holder">
									{this.state.inventory?.map(t => (
										<div className="tool" key={`inventory-${t?.tool?.template}`}>
											<img src={`https://cloudflare-ipfs.com/ipfs/${t.tool.img}`} className="card" />
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
