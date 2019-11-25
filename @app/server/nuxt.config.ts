import path from "path";
export default {
  modulesDir: [
    path.resolve(__dirname, "../../node_modules/"),
    path.resolve(__dirname, "../../@app/"), // TODO: (more testing) let's nuxt see @app after hot-reload
  ],
  server: {
    port: parseInt(process.env.PORT || "", 10) || 3000, // default: 3000
    host: "0.0.0.0", // default: localhost
  },
  srcDir: "src/nuxt",
  env: {},
  head: {
    title: "graphile-starter",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "graphile starter using nuxt.js w/ TS",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },
  loading: { color: "#3B8070" },
  css: [
    "src/nuxt/assets/css/main.css",
    {
      src: "ant-design-vue/dist/antd.less",
      lang: "less",
    },
  ],
  build: {
    extend(config: any, ctx: any) {
      // adds nuxt debug
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? "source-map" : "inline-source-map";
      }
    },
    loaders: {
      less: {
        javascriptEnabled: true,
        /*         modifyVars: {
          "primary-color": "rgba(222, 12, 101, 1.0)",
          "component-background": "#ffffff",
        }, */
      },
    },
  },
  buildModules: ["@nuxt/typescript-build"],
  modules: ["@nuxtjs/axios", "~/modules/nuxt-postgraphile", "@nuxtjs/apollo"],
  plugins: ["~/plugins/composition-api"],
  axios: {},
  // Give apollo module options
  apollo: {
    tokenName: "apollo-token", // optional, default: apollo-token
    cookieAttributes: {
      /**
       * Define when the cookie will be removed. Value can be a Number
       * which will be interpreted as days from time of creation or a
       * Date instance. If omitted, the cookie becomes a session cookie.
       */
      expires: 7, // optional, default: 7 (days)

      /**
       * Define the path where the cookie is available. Defaults to '/'
       */
      path: "/", // optional
      /**
       * Define the domain where the cookie is available. Defaults to
       * the domain of the page where the cookie was created.
       */
      // domain: 'example.com', // optional

      /**
       * A Boolean indicating if the cookie transmission requires a
       * secure protocol (https). Defaults to false.
       */
      secure: false,
    },
    includeNodeModules: true, // optional, default: false (this includes graphql-tag for node_modules folder)
    authenticationType: "Basic", // optional, default: 'Bearer'
    // (Optional) Default 'apollo' definition
    defaultOptions: {
      // See 'apollo' definition
      // For example: default query options
      $query: {
        loadingKey: "loading",
        fetchPolicy: "cache-and-network",
      },
    },
    // optional
    errorHandler: "~/plugins/apollo-error-handler.ts",
    // required
    clientConfigs: {
      default: {
        // required
        httpEndpoint: "http://localhost:5678",
        // optional
        // override HTTP endpoint in browser only
        browserHttpEndpoint: "/api/graphql",
        // optional
        // See https://www.apollographql.com/docs/link/links/http.html#options
        httpLinkOptions: {
          credentials: "same-origin",
        },
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        wsEndpoint: "ws://localhost:5678", // optional
        // LocalStorage token
        tokenName: "apollo-token", // optional
        // Enable Automatic Query persisting with Apollo Engine
        persisting: false, // Optional
        // Use websockets for everything (no HTTP)
        // You need to pass a `wsEndpoint` for this to work
        websocketsOnly: false, // Optional
      },
      test: {
        httpEndpoint: "http://localhost:5000",
        wsEndpoint: "ws://localhost:5000",
        tokenName: "apollo-token",
      },
    },
  },
  // TODO: import config from @app/config or similar
  postgraphile: {
    options: {
      //appendPlugins: [PgSimplifyInflectorPlugin],
      graphiql: true,
      // Optional customisation
      graphileBuildOptions: {
        /*
         * Uncomment if you are using `simpleCollections: 'only'` and you never
         * want relay connections
         */
        //pgOmitListSuffix: true,
        /*
         * Uncomment if you want 'userPatch' instead of 'patch' in update
         * mutations.
         */
        //pgSimplifyPatch: false,
        /*
         * Uncomment if you want 'allUsers' instead of 'users' at root level.
         */
        //pgSimplifyAllRows: false,
      },
    },
  },
  vue: {
    config: {
      productionTip: false,
      devtools: true,
    },
  },
};
