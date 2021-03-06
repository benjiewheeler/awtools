import HtmlWebPackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";

const config: webpack.Configuration = {
	entry: {
		index: "./src/scripts/pages/Index.tsx",
		builder: "./src/scripts/pages/Builder.tsx",
		inventory: "./src/scripts/pages/Inventory.tsx",
		spy: "./src/scripts/pages/Spy.tsx",
		monitor: "./src/scripts/pages/Monitor.tsx",
		history: "./src/scripts/pages/History.tsx",
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
	},
	module: {
		rules: [
			{ test: /\.(ts|tsx)$/, use: [{ loader: "ts-loader", options: { configFile: "tsconfig.main.json" } }] },
			{ test: /\.less$/i, use: ["style-loader", "css-loader", "less-loader"] },
			{ test: /\.css$/i, use: ["style-loader", "css-loader"] },
			{ test: /\.html$/i, use: ["html-loader"] },
			{ test: /\.mp3$/i, use: [{ loader: "file-loader", options: { name: "[name].[ext]" } }] },
			{ test: /\.js$/, enforce: "pre", use: ["source-map-loader"] },
		],
	},
	resolve: {
		extensions: [".html", ".css", ".js", ".ts", ".tsx", ".png"],
	},
	plugins: [
		new HtmlWebPackPlugin({
			cache: true,
			chunks: ["index"],
			favicon: "./src/images/favicon.png",
			filename: "./index.html",
			inject: "body",
			minify: false,
			scriptLoading: "blocking",
			template: "./src/html/index.html",
		}),
		new HtmlWebPackPlugin({
			cache: true,
			chunks: ["builder"],
			favicon: "./src/images/favicon.png",
			filename: "./builder.html",
			inject: "body",
			minify: false,
			scriptLoading: "blocking",
			template: "./src/html/index.html",
		}),
		new HtmlWebPackPlugin({
			cache: true,
			chunks: ["inventory"],
			favicon: "./src/images/favicon.png",
			filename: "./inventory.html",
			inject: "body",
			minify: false,
			scriptLoading: "blocking",
			template: "./src/html/index.html",
		}),
		new HtmlWebPackPlugin({
			cache: true,
			chunks: ["spy"],
			favicon: "./src/images/favicon.png",
			filename: "./spy.html",
			inject: "body",
			minify: false,
			scriptLoading: "blocking",
			template: "./src/html/index.html",
		}),
		new HtmlWebPackPlugin({
			cache: true,
			chunks: ["monitor"],
			favicon: "./src/images/favicon.png",
			filename: "./monitor.html",
			inject: "body",
			minify: false,
			scriptLoading: "blocking",
			template: "./src/html/index.html",
		}),
		new HtmlWebPackPlugin({
			cache: true,
			chunks: ["history"],
			favicon: "./src/images/favicon.png",
			filename: "./history.html",
			inject: "body",
			minify: false,
			scriptLoading: "blocking",
			template: "./src/html/index.html",
		}),
	],
	watchOptions: {
		ignored: ["./dist/**/*", "./node_modules/**"],
		aggregateTimeout: 3000,
	},
};

export default config;
