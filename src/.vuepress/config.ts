import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "孤独星球漫游",
  description: "孤独星球漫游",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
