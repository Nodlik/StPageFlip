const path = require('path');

module.exports = {
    entry: './src/StPageFlip/PageFlip.ts',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'pageFlip.browser.js',
        library: 'St'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css/,
                use: [{
                        loader: "style-loader"
                    }, {
                        loader: "css-loader"
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