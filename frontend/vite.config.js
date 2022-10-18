import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ command, mode, ssrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // config options
  if (command === "serve") {
  } else {
  }
  return {
    mode: "development",
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    resolve: {
      extensions: [".js", ".mjs"],
    },
    server: {
      host: "localhost",
      port: 3000,
      hmr: {
        protocol: "ws",
        host: "localhost",
				port: 3000,
      },
      watch: {
        ignored: ["/node_modules/**"],
      },
    },
    optimizeDeps: {
      exclude: ["package.json"],
    },
  };
});
