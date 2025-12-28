/**
 * E-ink Royal - Royal Road Proxy for Kindle
 * Main entry point
 */
import { PORT } from "./config";
import { handleRequest } from "./routes";
import { initBrowser, closeBrowser } from "./services/scraper";
import { startJobs, stopJobs } from "./services/jobs";

// Initialize browser on startup
console.log("Starting E-ink Royal Proxy...");
initBrowser()
  .then(() => {
    // Start background cache jobs after browser is ready
    startJobs();
  })
  .catch(console.error);

// Start HTTP server
const server = Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(`E-ink Royal Proxy running at http://localhost:${server.port}`);
console.log("Press Ctrl+C to stop");

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  stopJobs();
  await closeBrowser();
  process.exit(0);
});
