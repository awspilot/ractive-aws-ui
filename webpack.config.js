const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	node: false,
	mode: 'production',
	performance: {
		hints: false,
	},
	target: 'web',
	context: path.resolve(__dirname, 'src'),
	optimization: {
		minimize: true,
		minimizer: [new UglifyJsPlugin({
			uglifyOptions: { ecma: 7 },
			sourceMap: true,
			include: /\.min\.js$/
		})]
	},
	plugins: [
		new MiniCssExtractPlugin({ filename: "[name].css" }), // { filename: "[name].[contentHash].css" }
	],
	entry: {
		'ractive-aws-ui': path.resolve(__dirname, './src/index.js'),
		'ractive-aws-ui.min': path.resolve(__dirname, './src/index.js')
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		library: 'aws-ui',

		// var, this, window, umd
		libraryTarget: 'umd',
		libraryExport: 'default',
		umdNamedDefine: true   // Important
	},
	externals: {
		ractive: {
			commonjs: 'ractive',
			commonjs2: 'ractive',
			amd: 'ractive',
			root: 'Ractive'
		},
		"aws-sdk": {
				commonjs: 'aws-sdk',
				commonjs2: 'aws-sdk',
				root: 'AWS'
		},
	},
	module: {
		rules: [

			{
				test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader, // extract css into files
					{
						loader: 'css-loader', // translates CSS into CommonJS
					},
					{
						loader: 'less-loader', // compiles Less to CSS
						// options: {
						//	paths: [path.resolve(__dirname, 'node_modules')],
						// 	strictMath: true,
						// 	noIeCompat: true,
						// },
					},
				],
			},


			{
					test: /\.js$/,
					exclude: /node_modules/,
					use: 'babel-loader'
			},

		]
	}
}
