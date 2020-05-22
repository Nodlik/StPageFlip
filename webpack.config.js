const path = require('path');

module.exports = {
    entry: './src/StPageFlip/App.ts',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'stPageFlip.bundle.js',
        library: 'StPageFlip'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [{
                        loader: "style-loader"
                    }, {
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }]
            },
            { test: /\.ts$/, use: 'ts-loader' },
        ],
    },
    resolve: {
        extensions: ['.ts']
    },
    watch: true
};