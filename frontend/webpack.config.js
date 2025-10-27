const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    mode: "development",
    entry: "./src/index.tsx",
    devtool: "source-map",
    devServer: {
        static: {
            directory: path.join(__dirname, "src", "public"),
        },
        historyApiFallback: true,
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".css"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: ["file-loader?name=[name].[ext]"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/public/index.html",
            favicon: "./src/public/images/favicon.png",
        }),
        new webpack.DefinePlugin({
            "process.env.PUBLIC_URL": JSON.stringify("/"),
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
    ],
};