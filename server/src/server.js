import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureDefaultAdmin } from "./services/authService.js";

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDatabase();
    await ensureDefaultAdmin();
    app.listen(env.port, () => {
      console.log(`Server listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
