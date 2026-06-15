import { buildApp } from "./app";

async function bootstrap() {
  const app = buildApp();

  await app.listen({
    host: "0.0.0.0",
    port: 3333,
  });
}

bootstrap();