import React from "react";
import ReactDOM from "react-dom";
import "../../style/index.less";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export class Index extends React.Component<unknown, unknown> {
	constructor(props: unknown) {
		super(props);
	}
	render(): JSX.Element {
		return (
			<div className="page inventory">
				<Header title="Alien Worlds Tools" skipInput={true} />
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
					<a href="/monitor" className="link">
						Monitor
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
