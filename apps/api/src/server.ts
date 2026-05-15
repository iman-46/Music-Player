import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

async function bootstrap() {
  await connectDatabase();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Aurora API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
