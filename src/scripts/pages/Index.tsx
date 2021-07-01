import React from "react";
import ReactDOM from "react-dom";
import "../../style/index.less";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export class Index extends React.Component<unknown, unknown> {
	constructor(props: unknown) {
		super(props);
	}
	render(): JSX.Element {
		return (
			<div className="page inventory">
				<Header title="Alien Worlds Tools" />
				<div className="body">
					<a href="/inventory" className="link">
						Inventory
					</a>
					<a href="/builder" className="link">
						Builder
					</a>
					<a href="/spy" className="link">
						Spy
					</a>
				</div>
				<Footer />
			</div>
		);
	}
}

(async () => {
	ReactDOM.render(<Index />, document.getElementById("root"));
})();
