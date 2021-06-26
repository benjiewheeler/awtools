import React from "react";

export class Error extends React.Component<unknown, unknown> {
	constructor(props: unknown) {
		super(props);
	}

	render(): JSX.Element {
		return <div className="error">An error occurred, please try again</div>;
	}
}
