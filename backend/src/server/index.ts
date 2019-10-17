#!/usr/bin/env node
/* eslint-disable no-console */
import * as express from "express";
import { Nuxt, Builder } from "nuxt";
import chalk from "chalk";
import { createServer } from "http";
import { sanitiseEnv } from "./utils";
import * as middleware from "./middleware";
// Import and Set Nuxt.js options
import config from "../nuxtjs/nuxt.config";

// @ts-ignore
const packageJson = require("../../../package.json");

async function main() {
  sanitiseEnv();

  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";

  /*
   * Init Nuxt.js
   */
  const nuxt = new Nuxt(config);
  const { port } = nuxt.options.server;

  /*
   * Our Express server
   */
  const app = express();

  /*
   * For a clean nodemon shutdown, we need to close all our sockets otherwise
   * we might not come up cleanly again (inside nodemon).
   */
  const shutdownActions: (() => any)[] = [];
  app.set("shutdownActions", shutdownActions);

  if (isDev) {
    shutdownActions.push(() => require("inspector").close());

    /*
     * Build nuxtjs only in dev mode
     */
    const builder = new Builder(nuxt);
    /*
     * Don’t `await` for the builder.build().
     * This is because if you did await its execution
     * you wouldn’t see Nuxt’s loading screen.
     */
    builder.build();
  } else {
    await nuxt.ready();
  }

  /*
   * Getting access to the HTTP server directly means that we can do things
   * with websockets if we need to (e.g. GraphQL subscriptions).
   */
  const httpServer = createServer(app);
  app.set("httpServer", httpServer);

  /*
   * When we're using websockets, we may want them to have access to
   * sessions/etc for authentication.
   */
  const websocketMiddlewares: express.RequestHandler[] = [];
  app.set("websocketMiddlewares", websocketMiddlewares);

  /*
   * Middleware is installed from the /server/middleware directory. These
   * helpers may augment the express app with new settings and/or install
   * express middleware. These helpers may be asynchronous, but they should
   * operate very rapidly to enable quick as possible server startup.
   */
  await middleware.installDatabasePools(app);
  await middleware.installHelmet(app);
  await middleware.installSession(app);
  await middleware.installPassport(app);
  await middleware.installLogging(app);
  // These are our assets: images/etc; served out of the /client/public folder
  await middleware.installSharedStatic(app);
  if (isTest || isDev) {
    await middleware.installCypressServerCommand(app);
  }
  await middleware.installPostGraphile(app);

  /*
   * Give nuxt middleware to express
   ! Needs to be placed after `middleware.installPostGraphile`
   ! otherwise postgraphile routes won't work
   */
  ////  await middleware.installNext(app);
  app.use(nuxt.render);

  /*
   * Error handling middleware
   */
  await middleware.installErrorHandler(app);

  // And finally, we open the listen port
  const PORT = parseInt(port || "", 10) || 3000;
  httpServer.listen(PORT, () => {
    // _address not used because we don't need the docker-intern network id
    const _address = httpServer.address().address;
    //TODO: const actualPort = "8080"; // as configured in docker-compose.yml
    const actualPort = PORT;
    consola.ready({
      message: `
        ${chalk.bold(packageJson.name)} listening on port ${chalk.bold(
        actualPort
      )}
        Site:     ${chalk.bold.underline(`http://localhost:${actualPort}`)}
        GraphiQL: ${chalk.bold.underline(
          `http://localhost:${actualPort}/api/graphiql`
        )}
        GraphQL: ${chalk.bold.underline(
          `http://localhost:${actualPort}/api/graphql`
        )}
        `,
      badge: true,
    });
  });

  // Nodemon SIGUSR2 handling
  shutdownActions.push(() => httpServer.close());
  async function gracefulShutdown(callback: () => void) {
    try {
      await Promise.all(shutdownActions.map(fn => fn()));
    } finally {
      // 250ms of sleep before finally shutting down, give things a moment to
      // clear up.
      setTimeout(callback, 250);
    }
  }
  process.once("SIGUSR2", () => {
    gracefulShutdown(() => {
      process.kill(process.pid, "SIGUSR2");
    });
  });
}

main().catch(e => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(101);
});
