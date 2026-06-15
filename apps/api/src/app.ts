import Fastify from "fastify";
import { identityRoutes } from "./identity/routes/auth";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });
  app.setValidatorCompiler(validatorCompiler);

  app.setSerializerCompiler(serializerCompiler);
  app.register(identityRoutes, {
    prefix: "/api/v1/auth",
  });

  return app;
}
