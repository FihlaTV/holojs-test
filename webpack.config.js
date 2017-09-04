var ModuleConcatenationPlugin = require('webpack').optimize.ModuleConcatenationPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var GenerateJSONPlugin = require('generate-json-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    plugins: [
        new ModuleConcatenationPlugin(),
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new GenerateJSONPlugin('index.json', {
            scripts: ['holo.js']
        }, null, '    ')
    ],
    module: {
        rules: [
            {
                test: /\.(png)$/,
                loader: 'file-loader',
                options: {
                    name: 'res/[hash].[ext]'
                }
            },
            {
                test: /\.(vert|frag)$/,
                loader: 'raw-loader'
            },
            {
                test: /\.js$/,
                include: [/three[\\|\/]examples/],
                use: [{
                    loader: 'imports-loader',
                    query: {
                        THREE: 'three'
                    }
                }]
            }
        ]
    },
    output: {
        path: __dirname + '/build',
        filename: 'holo.js'
    },
    devServer: {
        inline: false,
        host: "0.0.0.0",
        contentBase: "build",
        compress: true
    },
    devtool: 'source-map'
}