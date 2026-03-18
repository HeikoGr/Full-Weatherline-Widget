const fs = require("fs")
const path = require("path")
const { spawn, execFile } = require("child_process")

const { startPreviewServer } = require("./serve")

const rootDir = path.resolve(__dirname, "..")
const renderScript = path.join(__dirname, "render.js")

function parseArgs(argv) {
  return {
    serve: argv.includes("--serve"),
    open: argv.includes("--open"),
  }
}

function shouldRebuild(filePath) {
  if (!filePath) {
    return false
  }

  if (filePath === path.join(rootDir, "Full-Weatherline-Widget.js")) {
    return true
  }

  if (filePath === path.join(rootDir, "emulator.config.json")) {
    return true
  }

  return filePath.startsWith(path.join(rootDir, "emulator")) && filePath.endsWith(".js")
}

function runRender() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [renderScript], {
      cwd: rootDir,
      stdio: "inherit",
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Render fehlgeschlagen mit Exit-Code ${code}`))
    })
  })
}

async function openBrowser(url) {
  if (!process.env.BROWSER) {
    return
  }

  await new Promise((resolve) => {
    execFile(process.env.BROWSER, [url], () => resolve())
  })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  let server = null
  let scheduled = null
  let isRunning = false

  if (args.serve) {
    server = await startPreviewServer()
  }

  await runRender()

  if (args.open) {
    const url = args.serve
      ? "http://localhost:4173/"
      : `file://${path.join(rootDir, "emulator-output", "widget-preview.html")}`
    await openBrowser(url)
  }

  const watchers = [
    fs.watch(rootDir, (eventType, fileName) => {
      const filePath = fileName ? path.join(rootDir, fileName.toString()) : null
      trigger(filePath, eventType)
    }),
    fs.watch(path.join(rootDir, "emulator"), (eventType, fileName) => {
      const filePath = fileName ? path.join(rootDir, "emulator", fileName.toString()) : null
      trigger(filePath, eventType)
    }),
  ]

  function trigger(filePath, eventType) {
    if (!shouldRebuild(filePath)) {
      return
    }

    if (scheduled) {
      clearTimeout(scheduled)
    }

    scheduled = setTimeout(async () => {
      if (isRunning) {
        return
      }

      isRunning = true
      console.log(`Aenderung erkannt (${eventType}): ${path.relative(rootDir, filePath)}`)
      try {
        await runRender()
      } catch (error) {
        console.error(error.message)
      } finally {
        isRunning = false
      }
    }, 150)
  }

  const closeAll = () => {
    watchers.forEach((watcher) => watcher.close())
    if (server) {
      server.close()
    }
    process.exit(0)
  }

  process.on("SIGINT", closeAll)
  process.on("SIGTERM", closeAll)
  console.log("Watch-Modus aktiv. Aenderungen am Widget oder Emulator triggern einen Neuaufbau.")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
