const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '/',
        clean: true
    },
    resolve: {
        alias: {
            'assets': path.resolve(__dirname, 'src/assets/')
        },
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /\.module\.css$/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: true
                        }
                    }
                ],
                include: /\.module\.css$/
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            context: 'src',
                        }
                    }
                ]
            },
            {
                test: /\.txt$/,
                use: 'raw-loader'
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'vue-html-loader',
                        options: {
                            transformAssetUrls: {
                                img: 'src'
                            }
                        }
                    }
                ]
            },
            {
                test: /\.json$/,
                type: 'json'
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        compress: true,
        port: 9000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' }
            ]
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
};
