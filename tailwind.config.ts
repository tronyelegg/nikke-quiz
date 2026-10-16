import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // 이 부분이 반드시 있어야 버튼으로 다크모드를 켤 수 있습니다.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;