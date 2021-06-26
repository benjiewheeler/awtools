import React from "react";

export class Header extends React.Component<unknown, unknown> {
	constructor(props: unknown) {
		super(props);
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

				<h1 className="title">Alien worlds tool build</h1>
			</div>
		);
	}
}
