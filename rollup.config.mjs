import terser from "@rollup/plugin-terser";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/index.js",
    format: "cjs",
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    terser(),
  ],
};
