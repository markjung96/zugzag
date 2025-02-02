/* eslint-disable @typescript-eslint/no-require-imports */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          webpackConfig.resolve.plugins.push(new TsconfigPathsPlugin({}));

          // 기존의 모든 service worker 플러그인 제거
          webpackConfig.plugins = webpackConfig.plugins.filter(
            (plugin) => plugin.constructor.name !== 'GenerateSW' && plugin.constructor.name !== 'InjectManifest',
          );

          // 새로운 service worker 플러그인 추가
          webpackConfig.plugins.push(
            new WorkboxWebpackPlugin.InjectManifest({
              swSrc: path.resolve(__dirname, 'src/service-worker.ts'),
              swDest: 'service-worker.js',
              maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
              exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
            }),
          );

          return webpackConfig;
        },
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => {
      // entry가 객체인 경우 service-worker 관련 엔트리 제거
      if (typeof webpackConfig.entry === 'object' && !Array.isArray(webpackConfig.entry)) {
        Object.keys(webpackConfig.entry).forEach((key) => {
          if (key.includes('service-worker')) {
            delete webpackConfig.entry[key];
          }
        });
      }
      // entry가 배열인 경우
      else if (Array.isArray(webpackConfig.entry)) {
        webpackConfig.entry = webpackConfig.entry.filter((entry) => !entry.includes('service-worker'));
      }
      return webpackConfig;
    },
  },
};
