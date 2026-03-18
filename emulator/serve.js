const http = require("http")
const fs = require("fs/promises")
const path = require("path")

const rootDir = path.resolve(__dirname, "..")
const outputDir = path.join(rootDir, "emulator-output")

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
}

function resolvePath(urlPath) {
  const normalized = urlPath === "/" ? "/widget-preview.html" : urlPath
  const absolutePath = path.join(outputDir, normalized)
  if (!absolutePath.startsWith(outputDir)) {
    return null
  }
  return absolutePath
}

function createPreviewServer() {
  return http.createServer(async (request, response) => {
    const filePath = resolvePath(new URL(request.url, `http://${request.headers.host}`).pathname)

    if (!filePath) {
      response.writeHead(400)
      response.end("Bad request")
      return
    }

    try {
      const file = await fs.readFile(filePath)
      const extension = path.extname(filePath)
      response.writeHead(200, {
        "Content-Type": contentTypes[extension] || "application/octet-stream",
        "Cache-Control": "no-store",
      })
      response.end(file)
    } catch (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500)
      response.end(error.code === "ENOENT" ? "Preview noch nicht erzeugt." : "Serverfehler")
    }
  })
}

function startPreviewServer(port = Number.parseInt(process.env.PORT || "4173", 10)) {
  const server = createPreviewServer()
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Preview-Server laeuft auf http://localhost:${port}`)
      resolve(server)
    })
  })
}

if (require.main === module) {
  startPreviewServer()
}

module.exports = {
  startPreviewServer,
}
