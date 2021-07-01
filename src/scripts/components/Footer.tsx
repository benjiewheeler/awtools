import React from "react";

export class Footer extends React.Component<unknown, unknown> {
	constructor(props: unknown) {
		super(props);
	}

	render(): JSX.Element {
		return (
			<div className="foot">
				<div className="potassium-support">
					<span>You like it ?</span>
					<span>Send the author some potassium</span>
					<a
						href="https://creeper.banano.cc/explorer/account/ban_1p7fno5eksni6scqji1euce5p36ahaheh43qqyzabfo7azaseejyzqoikchk"
						className="wallet-link"
						rel="noreferrer"
						target="_blank"
					>
						ban_1p7fno5eksni6scqji1euce5p36ahaheh43qqyzabfo7azaseejyzqoikchk
					</a>
				</div>
				<div className="credit">
					<span>Made by </span>
					<a className="discord-link" target="_blank">
						Benjie#5458
					</a>
					<span> | </span>
					<a href="https://github.com/benjiewheeler/" className="github-link" rel="noreferrer" target="_blank">
						benjiewheeler
					</a>
				</div>
			</div>
		);
	}
}
