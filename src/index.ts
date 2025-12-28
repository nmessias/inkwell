/**
 * Inkwell - Web Fiction Proxy for E-ink Devices
 * Main entry point
 */
import { PORT } from "./config";
import { handleRequest } from "./routes";
import { initBrowser, closeBrowser } from "./services/scraper";
import { startJobs, stopJobs } from "./services/jobs";

// Initialize browser on startup
console.log("Starting Inkwell...");
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

console.log(`Inkwell running at http://localhost:${server.port}`);
console.log("Press Ctrl+C to stop");

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  stopJobs();
  await closeBrowser();
  process.exit(0);
});
