const path = require('path');
},
devtool: 'source-map',
    module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        },
        {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.(png|jpg|jpeg|gif|svg)$/i,
            type: 'asset/resource'
        },
        {
            enforce: 'pre',
            test: /\.js$/,
            loader: 'source-map-loader'
        }
    ]
},
plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html')
    })
],
    devServer: {
    static: path.resolve(__dirname, 'public'),
        historyApiFallback: true,
            port: 3000,
                hot: true,
                    open: true
}
};