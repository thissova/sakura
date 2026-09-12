/**
 * Dev entry point for the API.
 *
 * `npm run dev` runs the API and Vite side by side. The API reads PORT, which in
 * production is what the host assigns — but a launcher that sets PORT for the
 * dev server hands it Vite's port, and the two fight over it: the API wins, Vite
 * moves, and every /api call 502s because the proxy still points at 3001.
 *
 * Pinning the port here keeps the API where vite.config.ts expects it, whatever
 * PORT happens to be set to. Override with API_PORT if 3001 is taken.
 */
process.env.PORT = process.env.API_PORT || "3001";

await import("./index.js");
