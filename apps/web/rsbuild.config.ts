import { ArcoDesignPlugin } from '@arco-plugins/unplugin-react';
import { defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
  plugins: [pluginReact(), pluginLess(), pluginSvgr()],
  html: {
    title: 'Mini CI',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    }
  },
  tools: {
    rspack: {
      plugins: [
        new ArcoDesignPlugin({
          defaultLanguage: 'zh-CN',
        }),
      ],
    },
  },
});
