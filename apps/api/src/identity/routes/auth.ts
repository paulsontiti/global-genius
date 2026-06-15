import { FastifyInstance } from "fastify";
import { makeRegisterController } from "../DI/register.controller";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { registerSchema } from "../schemas/register.schema";
import { makeLoginController } from "../DI/login.controller";

export async function identityRoutes(app: FastifyInstance) {
  const controller = makeRegisterController();
  const loginController  = makeLoginController()

  app.withTypeProvider<ZodTypeProvider>()
  .post(
    "/register",
    {
      schema: {
        body: registerSchema,
      },
    }, controller.handle.bind(controller));


    app.withTypeProvider<ZodTypeProvider>()
  .post(
    "/login",
    {
      schema: {
        body: registerSchema,
      },
    }, controller.handle.bind(loginController));
}
