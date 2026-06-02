import app from './app'
import { rabbitmq } from "#rabbitmq";

async function bootstrap() {
  // Connect RabbitMQ
  await rabbitmq();

  // Start HTTP server
  Bun.serve({
    port: process.env.PORT ?? 3000,
    fetch: app.fetch,
  });

  console.log('Server running on port 3000');
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
