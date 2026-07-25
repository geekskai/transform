const path = require("path");
const webpack = require("webpack");

const config = {
  transpilePackages: ["lucide-react", "cmdk", "is-svg"],
  async rewrites() {
    return [
      { source: "/robots.txt", destination: "/api/robots" },
      { source: "/sitemap.xml", destination: "/api/sitemap" },
      { source: "/llms.txt", destination: "/api/llms" }
    ];
  },
  webpack(config, options) {
    if (!options.isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        net: false,
        tls: false,
        child_process: false,
        readline: false,
        process: false,
        path: false
      };
    }

    // Avoid relay-compiler in browser/worker by stubbing relay-operation-optimizer.
    // This import happens at module load time and triggers process.hrtime.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@graphql-tools/relay-operation-optimizer": path.resolve(
        __dirname,
        "workers/relay-operation-optimizer-stub.js"
      ),
      "@graphql-tools/relay-operation-optimizer/esm/index.js": path.resolve(
        __dirname,
        "workers/relay-operation-optimizer-stub.js"
      ),
      "@graphql-tools/relay-operation-optimizer/esm/index": path.resolve(
        __dirname,
        "workers/relay-operation-optimizer-stub.js"
      )
    };

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.DEV": JSON.stringify(options.dev),
        IN_BROWSER: !options.isServer,
        IS_DEV: options.dev
      })
    );

    config.module.rules.unshift({
      test: /\.worker\.ts$/,
      use: {
        loader: "worker-loader",
        options: {
          filename: "static/[hash].worker.js",
          publicPath: "/_next/"
        }
      }
    });

    config.output.globalObject = "self";

    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true
    };

    return config;
  }
};

module.exports = config;
