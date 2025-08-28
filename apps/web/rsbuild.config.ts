import { ArcoDesignPlugin } from "@arco-plugins/unplugin-react";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
  plugins: [pluginReact(), pluginLess(), pluginSvgr()],
  tools: {
    rspack: {
      plugins: [
        new ArcoDesignPlugin({
          defaultLanguage: "zh-CN",
        }),
      ],
    },
  },
});
