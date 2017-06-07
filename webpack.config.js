var HtmlWebpackPlugin = require('html-webpack-plugin');
var GenerateJSONPlugin = require('generate-json-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    plugins: [
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
            }
        ]
    },
    output: {
        path: __dirname + '/build',
        filename: 'holo.js'
    }
}