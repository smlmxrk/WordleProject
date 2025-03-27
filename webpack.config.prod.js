import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

export default merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './games/wordle.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'asserts' },
        { from: 'css', to: 'css' },
        { from: 'assets/icon.svg', to: 'assets/icon.svg' },
        { from: 'assets/favicon.ico', to: 'assets/favicon.ico' },
        { from: 'assets/icon.png', to: 'assets/icon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
