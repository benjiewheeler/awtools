import React from "react";

interface ErrorProps {
	text?: string;
}

export class Error extends React.Component<ErrorProps, unknown> {
	constructor(props: ErrorProps) {
		super(props);
	}

	render(): JSX.Element {
		return <div className="error">{this?.props?.text || "An error occurred, please try again"}</div>;
	}
}
