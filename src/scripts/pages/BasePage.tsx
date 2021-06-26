import React from "react";
import { URLHashManager } from "../util/URLHashManager";

export class BasePage<P = unknown, S = unknown> extends React.Component<P, S> {
	protected hashManager: URLHashManager;

	constructor(props: P) {
		super(props);
		this.hashManager = new URLHashManager();
	}
}
