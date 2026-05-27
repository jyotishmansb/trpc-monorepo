import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "ChaiForm API",
  version: "1.0.0",
  description: "Type-safe API for ChaiForm — a Typeform-style form builder and response management platform.",
  baseUrl: env.BASE_URL.concat("/api"),
  tags: [
    { name: "Authentication", description: "Register, login, and manage sessions" },
    { name: "Forms", description: "Create, manage, publish, and share forms" },
    { name: "Fields", description: "Manage form fields and validation rules" },
    { name: "Responses", description: "Submit and manage form responses" },
    { name: "Analytics", description: "Form performance analytics and field insights" },
    { name: "Themes", description: "Built-in form themes and visual customization" },
    { name: "Explore", description: "Public form gallery and template browser" },
  ],
});

if (env.NODE_ENV !== "prod") {
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    })
  );
}

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    message: "ChaiForm API is up and running ☕",
    docs: `${env.BASE_URL}/docs`,
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  return res.json({ message: "ChaiForm API is healthy", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use(
  "/docs",
  apiReference({
    url: "/openapi.json",
    theme: "purple",
    layout: "modern",
  })
);

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  })
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        logger.error("tRPC error:", error);
      }
    },
  })
);

export default app;
