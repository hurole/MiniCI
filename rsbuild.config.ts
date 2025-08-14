import { ArcoDesignPlugin } from "@arco-plugins/unplugin-react";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginLess } from "@rsbuild/plugin-less";

export default defineConfig({
  plugins: [pluginReact(), pluginLess()],
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
