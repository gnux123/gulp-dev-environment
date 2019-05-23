process.noDeprecation = true;
const webpack = require('webpack');

module.exports = {
    devtool: "source-map",
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "React": "React",
        "ReactDOM": "ReactDOM",
        "react-addons-transition-group": "var React.addons.TransitionGroup",
        "react-addons-pure-render-mixin": "var React.addons.PureRenderMixin",
        "react-addons-create-fragment": "var React.addons.createFragment",
        "react-addons-update": "var React.addons.update"
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react'],
                    plugins: [
                        'transform-decorators-legacy',
                        'transform-class-properties'
                    ]
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ]
};