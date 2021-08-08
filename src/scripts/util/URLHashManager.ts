import qs from "querystring";
import { HashParams } from "../types/types";

export class URLHashManager {
	public static ACCOUNT_CHANGE_EVENT = "account_changed";
	public static ACCOUNT_PARAM = "account";
	private static instance: URLHashManager;

	private constructor() {
		window.addEventListener("hashchange", e => this.handleChange(e.oldURL, e.newURL));
	}

	public static getInstance(): URLHashManager {
		if (!this.instance) {
			this.instance = new URLHashManager();
		}

		return this.instance;
	}

	private handleChange(oldURL: string, newURL: string, forceEvent = false): void {
		const fromData = this.readHash(new URL(oldURL).hash);
		const toData = this.readHash(new URL(newURL).hash);

		if (toData?.account !== fromData?.account || forceEvent) {
			dispatchEvent(new CustomEvent(URLHashManager.ACCOUNT_CHANGE_EVENT, { detail: toData?.account }));
		}
	}

	readHash(hash: string = location.hash): HashParams {
		if (!hash || !hash.length) return {};
		while (hash.charCodeAt(0) === 35) hash = hash.substr(1);
		const data = qs.parse(hash);
		return data;
	}

	getHashParam(name: string, hash: string = location.hash): string {
		while (hash.charCodeAt(0) === 35) hash = hash.substr(1);
		const data = qs.parse(hash);
		const value = data[name];
		if (!value) return null;
		return value.toString();
	}

	setHashParam(name: string, value: string): void {
		if (this.getHashParam(name) === value) {
			this.handleChange(location.hash, `#${location.hash}`, true);
			return;
		}
		let hash = location.hash;
		if (hash.charCodeAt(0) === 35) hash = hash.substr(1);
		const data = qs.parse(hash);
		data[name] = value;
		location.hash = qs.stringify(data);
	}

	setHash(args: { [name: string]: string | number }): void {
		location.hash = qs.stringify(args);
	}
}
