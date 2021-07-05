import React, { createRef, RefObject } from "react";
import { URLHashManager } from "../util/URLHashManager";

interface HeaderProps {
	title: string;
	skipInput?: boolean;
}

export class Header extends React.Component<HeaderProps, unknown> {
	private accountRef: RefObject<HTMLInputElement> = createRef();
	protected hashManager: URLHashManager;

	constructor(props: HeaderProps) {
		super(props);
		this.hashManager = new URLHashManager();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		addEventListener(URLHashManager.ACCOUNT_CHANGE_EVENT, (e: CustomEvent<string>) => {
			this.accountRef.current.value = e.detail;
			this.forceUpdate();
		});
	}

	componentDidMount(): void {
		const account = this.hashManager.getHashParam(URLHashManager.ACCOUNT_PARAM);

		if (account) {
			this.accountRef.current.value = account;
			this.forceUpdate();
		}
	}

	onInputChange(): void {
		const account = this.accountRef.current.value.trim().toLowerCase();

		this.hashManager.setHashParam(URLHashManager.ACCOUNT_PARAM, account);
	}

	render(): JSX.Element {
		return (
			<div className="head">
				<div className="top-bar">
					<a href="/" className="nav-link">
						Home
					</a>
					<a href="/inventory" className="nav-link">
						Inventory
					</a>
					<a href="/builder" className="nav-link">
						Builder
					</a>
					<a href="/spy" className="nav-link">
						Spy
					</a>
				</div>
				<h1 className="title">{this.props.title}</h1>
				{!this.props.skipInput && (
					<>
						<div className="controls">
							<label htmlFor="waxid">Account</label>
							<input
								ref={this.accountRef}
								autoComplete="off"
								type="text"
								id="waxid"
								className="waxid"
								placeholder="monke.wam"
								onKeyPress={e => e.key == "Enter" && this.onInputChange()}
							/>
							<input type="button" className="select" value="Select" onClick={() => this.onInputChange()} />
						</div>
						{this.accountRef?.current?.value && (
							<div className="quick-links">
								<a href={`/inventory#account=${this.accountRef?.current?.value}`} className="nav-link">
									Inventory
								</a>
								<a href={`/builder#account=${this.accountRef?.current?.value}`} className="nav-link">
									Builder
								</a>
								<a href={`/spy#account=${this.accountRef?.current?.value}`} className="nav-link">
									Spy
								</a>
							</div>
						)}
					</>
				)}
			</div>
		);
	}
}
