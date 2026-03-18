const fs = require("fs/promises")
const path = require("path")

const { createRuntime, renderWidgetToHtml } = require("./runtime")

const rootDir = path.resolve(__dirname, "..")
const defaultScriptPath = path.join(rootDir, "Full-Weatherline-Widget.js")
const defaultConfigPath = path.join(rootDir, "emulator.config.json")
const outputDir = path.join(rootDir, "emulator-output")

async function readConfig(configPath) {
  try {
    const raw = await fs.readFile(configPath, "utf8")
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === "ENOENT") {
      return {}
    }

    throw error
  }
}

async function main() {
  const config = await readConfig(defaultConfigPath)
  const runtimeOptions = {
    ...config,
    scriptPath: defaultScriptPath,
  }

  const runtime = await createRuntime(runtimeOptions)
  await runtime.run()

  if (!runtime.widget) {
    throw new Error("Das Script hat kein Widget ueber Script.setWidget registriert.")
  }

  await fs.mkdir(outputDir, { recursive: true })

  const html = await renderWidgetToHtml(runtime.widget, {
    title: "Full Weatherline Widget Preview",
    family: runtime.options.widgetFamily,
    widgetSizes: runtime.options.widgetSizes,
  })

  const htmlPath = path.join(outputDir, "widget-preview.html")
  const jsonPath = path.join(outputDir, "widget-tree.json")

  await fs.writeFile(htmlPath, html, "utf8")
  await fs.writeFile(jsonPath, JSON.stringify(runtime.widget.toJSON(), null, 2), "utf8")

  console.log(`Preview erstellt: ${path.relative(rootDir, htmlPath)}`)
  console.log(`Widget-Baum erstellt: ${path.relative(rootDir, jsonPath)}`)
  console.log(
    `Wetterdaten: ${runtime.options.useMockWeather ? "mock" : "live ueber Script-Request"}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
