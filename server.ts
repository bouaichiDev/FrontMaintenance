import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log("[Server] Starting Spring Boot backend in background...");
  
  // Ensure the Maven wrapper is executable on Unix-like environments
  const mvnwPath = path.join(process.cwd(), "api", "mvnw");
  try {
    if (fs.existsSync(mvnwPath)) {
      console.log("[Server] Setting executable permission on api/mvnw...");
      fs.chmodSync(mvnwPath, 0o755);
    }
  } catch (chmodErr) {
    console.error("[Server] Failed to set executable permission on api/mvnw:", chmodErr);
  }
  
  // Spawn the Spring Boot Maven process using ./mvnw
  const springBoot = spawn("./mvnw", ["spring-boot:run"], {
    cwd: path.join(process.cwd(), "api"),
    shell: true,
  });

  springBoot.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.log(`[Spring Boot] ${line}`);
      }
    }
  });

  springBoot.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.error(`[Spring Boot Error] ${line}`);
      }
    }
  });

  springBoot.on("close", (code) => {
    console.log(`[Server] Spring Boot process exited with code ${code}`);
  });

  // Proxy middleware for Spring Boot API, Swagger, and H2 Console
  const backendProxy = createProxyMiddleware({
    target: "http://127.0.0.1:8081",
    changeOrigin: true,
    ws: true, // Support WebSockets
    logLevel: "warn", // Keep logs clean unless there are errors
    onError: (err, req, res) => {
      // Gracefully handle case when Spring Boot is still booting up
      res.writeHead(503, { "Content-Type": "text/plain" });
      res.end("The back-end server is booting up, please refresh in a moment...");
    }
  } as any);

  // Mount the proxy for any of the Spring Boot endpoints
  app.use("/api", backendProxy);
  app.use("/h2-console", backendProxy);
  app.use("/swagger-ui", backendProxy);
  app.use("/swagger-ui.html", backendProxy);
  app.use("/v3/api-docs", backendProxy);
  app.use("/ws", backendProxy);

  // Serve static/Vite files
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Running in development mode. Mounting Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Running in production mode. Serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Gracefully handle process exit to terminate Spring Boot child process
  process.on("exit", () => {
    console.log("[Server] Terminating Spring Boot process...");
    springBoot.kill();
  });

  process.on("SIGINT", () => {
    console.log("[Server] Interrupted, terminating...");
    springBoot.kill();
    process.exit();
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server Error] Failed to start server:", err);
});
