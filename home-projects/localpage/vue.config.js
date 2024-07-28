const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = defineConfig({
  transpileDependencies: true,
  /**
   * //这里影响打包后index引用js的路径，
   * 和nodejs配合最合理的方案是这里随便写一个路径，不需要和所在服务器目录有关联
   * 然后再nodejs中通过静态目录映射就行
   */
  publicPath: '/v'
})
