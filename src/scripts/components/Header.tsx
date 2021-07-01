import React from "react";

interface HeaderProps {
	title: string;
}

export class Header extends React.Component<HeaderProps, unknown> {
	constructor(props: HeaderProps) {
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

				<h1 className="title">{this.props.title}</h1>
			</div>
		);
	}
}
