// Local-only server for the CBT app.
// It serves the app and saves completed attempts to ./results as JSON files.
const http = require("http");
const fs = require("fs");
const path = require("path");

const appDir = __dirname;
const resultsDir = path.join(appDir, "results");
const port = Number(process.env.PORT) || 3030;
const host = "127.0.0.1";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "POST" && url.pathname === "/api/results") {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      try {
        const attempt = JSON.parse(body);
        if (!attempt || typeof attempt !== "object" || !Array.isArray(attempt.questionsSnapshot)) {
          return sendJson(response, 400, { error: "Invalid CBT result." });
        }
        fs.mkdirSync(resultsDir, { recursive: true });
        const safeId = String(attempt.id || Date.now()).replace(/[^a-zA-Z0-9_-]/g, "");
        const fileName = `${safeId}.json`;
        fs.writeFileSync(path.join(resultsDir, fileName), JSON.stringify(attempt, null, 2));
        sendJson(response, 201, { saved: true, file: `results/${fileName}` });
      } catch (error) {
        sendJson(response, 400, { error: "Could not save CBT result." });
      }
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405);
    return response.end();
  }

  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.resolve(appDir, `.${requestedPath}`);
  if (!filePath.startsWith(appDir + path.sep)) {
    response.writeHead(403);
    return response.end();
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      return response.end();
    }
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : data);
  });
});

server.listen(port, host, () => {
  console.log(`AlgoCasts CBT is running at http://localhost:${port}`);
});
