const fs = require("fs/promises")
const fsSync = require("fs")
const path = require("path")
const vm = require("vm")

const { createCanvas, GlobalFonts } = require("@napi-rs/canvas")

const rootDir = path.resolve(__dirname, "..")
const lucideFontPath = path.join(rootDir, "node_modules", "lucide-static", "font", "lucide.ttf")
const openSansRegularFontPath = path.join(
  rootDir,
  "node_modules",
  "@fontsource",
  "open-sans",
  "files",
  "open-sans-latin-400-normal.woff"
)
const openSansBoldFontPath = path.join(
  rootDir,
  "node_modules",
  "@fontsource",
  "open-sans",
  "files",
  "open-sans-latin-700-normal.woff"
)
const lucideCodepointsPath = path.join(
  rootDir,
  "node_modules",
  "lucide-static",
  "font",
  "codepoints.json"
)
let lucideFontRegistered = false
let emulatorTextFontsRegistered = false
let lucideCodepoints = null

const DEFAULT_DRAW_CONTEXT_SCALE = 2

const DEFAULT_WIDGET_SIZES = {
  large: { width: 360, height: 379 },
  medium: { width: 360, height: 170 },
  small: { width: 170, height: 170 },
}

const SYMBOL_GLYPHS = {
  "cloud.bolt.rain.fill": "⛈",
  "cloud.drizzle.fill": "🌦",
  "cloud.rain.fill": "🌧",
  "cloud.sleet.fill": "🌨",
  "cloud.snow.fill": "❄",
  snow: "❄",
  tornado: "🌪",
  "cloud.fog.fill": "🌫",
  "sun.haze.fill": "🌤",
  "moon.stars.fill": "🌙",
  "sun.max.fill": "☀",
  "cloud.moon.fill": "☁",
  "cloud.sun.fill": "⛅",
  "cloud.fill": "☁",
  "sunrise.fill": "🌅",
  "sunset.fill": "🌇",
}

const SYMBOL_ICON_NAMES = {
  "cloud.bolt.rain.fill": "cloud-lightning",
  "cloud.drizzle.fill": "cloud-drizzle",
  "cloud.rain.fill": "cloud-rain",
  "cloud.sleet.fill": "cloud-rain-wind",
  "cloud.snow.fill": "cloud-snow",
  snow: "snowflake",
  tornado: "tornado",
  "cloud.fog.fill": "cloud-fog",
  "sun.haze.fill": "sun-dim",
  "moon.stars.fill": "moon-star",
  "sun.max.fill": "sun",
  "cloud.moon.fill": "cloud-moon",
  "cloud.sun.fill": "cloud-sun",
  "cloud.fill": "cloud",
  "sunrise.fill": "sunrise",
  "sunset.fill": "sunset",
}

function ensureLucideFontRegistered() {
  if (lucideFontRegistered) {
    return
  }

  if (fsSync.existsSync(lucideFontPath)) {
    GlobalFonts.registerFromPath(lucideFontPath, "LucideSymbols")
    lucideFontRegistered = true
  }
}

function ensureEmulatorTextFontsRegistered() {
  if (emulatorTextFontsRegistered) {
    return
  }

  if (fsSync.existsSync(openSansRegularFontPath)) {
    GlobalFonts.registerFromPath(openSansRegularFontPath, "EmulatorOpenSansRegular")
  }

  if (fsSync.existsSync(openSansBoldFontPath)) {
    GlobalFonts.registerFromPath(openSansBoldFontPath, "EmulatorOpenSansBold")
  }

  emulatorTextFontsRegistered = true
}

function getLucideCodepoints() {
  if (!lucideCodepoints) {
    lucideCodepoints = JSON.parse(fsSync.readFileSync(lucideCodepointsPath, "utf8"))
  }

  return lucideCodepoints
}

function getSymbolGlyph(symbolName) {
  ensureLucideFontRegistered()
  const iconName = SYMBOL_ICON_NAMES[symbolName]
  const codepoint = iconName ? getLucideCodepoints()[iconName] : null

  if (codepoint) {
    return {
      glyph: String.fromCodePoint(codepoint),
      fontFamily: "LucideSymbols",
    }
  }

  return {
    glyph: SYMBOL_GLYPHS[symbolName] || "□",
    fontFamily: null,
  }
}

function fontCss(font, overrideFamily = null) {
  if (!overrideFamily) {
    if (font.name === "system-ui") {
      ensureEmulatorTextFontsRegistered()
      const family = Number(font.weight) >= 600 ? "EmulatorOpenSansBold" : "EmulatorOpenSansRegular"
      return `${font.style} ${font.weight} ${font.size}px ${family}`
    }

    return font.toCss()
  }

  return `${font.style} ${font.weight} ${font.size}px ${overrideFamily}`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function clampPadding(value) {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function widgetSizeForFamily(family, overrides = {}) {
  const normalizedFamily = family === "small" || family === "medium" ? family : "large"
  const fallbackSize = DEFAULT_WIDGET_SIZES[normalizedFamily]
  const override = overrides?.[normalizedFamily]

  return {
    width: Number.isFinite(override?.width) && override.width > 0 ? override.width : fallbackSize.width,
    height:
      Number.isFinite(override?.height) && override.height > 0
        ? override.height
        : fallbackSize.height,
  }
}

function normalizeHex(hex) {
  const value = String(hex || "000000")
    .trim()
    .replace(/^#/, "")
  return value.length === 3
    ? value
        .split("")
        .map((char) => char + char)
        .join("")
    : value.padEnd(6, "0").slice(0, 6)
}

class Color {
  constructor(hex, alpha = 1) {
    this.hex = normalizeHex(hex)
    this.alpha = alpha
  }

  toRgba() {
    const red = Number.parseInt(this.hex.slice(0, 2), 16)
    const green = Number.parseInt(this.hex.slice(2, 4), 16)
    const blue = Number.parseInt(this.hex.slice(4, 6), 16)
    return `rgba(${red}, ${green}, ${blue}, ${this.alpha})`
  }

  static gray() {
    return new Color("808080", 1)
  }

  static black() {
    return new Color("000000", 1)
  }

  static white() {
    return new Color("ffffff", 1)
  }
}

class Font {
  constructor(name, size, options = {}) {
    this.name = name
    this.size = size
    this.weight = options.weight || "400"
    this.style = options.style || "normal"
  }

  static systemFont(size) {
    return new Font("system-ui", size)
  }

  static ultraLightSystemFont(size) {
    return new Font("system-ui", size, { weight: "200" })
  }

  static lightSystemFont(size) {
    return new Font("system-ui", size, { weight: "300" })
  }

  static regularSystemFont(size) {
    return new Font("system-ui", size, { weight: "400" })
  }

  static mediumSystemFont(size) {
    return new Font("system-ui", size, { weight: "500" })
  }

  static semiboldSystemFont(size) {
    return new Font("system-ui", size, { weight: "600" })
  }

  static boldSystemFont(size) {
    return new Font("system-ui", size, { weight: "700" })
  }

  static heavySystemFont(size) {
    return new Font("system-ui", size, { weight: "800" })
  }

  static blackSystemFont(size) {
    return new Font("system-ui", size, { weight: "900" })
  }

  static italicSystemFont(size) {
    return new Font("system-ui", size, { style: "italic" })
  }

  toCss() {
    return `${this.style} ${this.weight} ${this.size}px ${this.name}`
  }
}

class Size {
  constructor(width = 0, height = 0) {
    this.width = width
    this.height = height
  }
}

class Point {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}

class Rect {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

class Path {
  constructor() {
    this.commands = []
  }

  move(point) {
    this.commands.push({ type: "move", point })
  }

  addLine(point) {
    this.commands.push({ type: "line", point })
  }

  addRoundedRect(rect, radiusX, radiusY) {
    this.commands.push({ type: "roundedRect", rect, radiusX, radiusY })
  }

  addEllipse(rect) {
    this.commands.push({ type: "ellipse", rect })
  }
}

class LinearGradient {
  constructor() {
    this.colors = []
    this.locations = []
  }
}

class DateFormatter {
  constructor() {
    this.locale = undefined
    this.dateFormat = undefined
    this.dateStyle = "medium"
    this.timeStyle = undefined
  }

  useNoDateStyle() {
    this.dateStyle = undefined
  }

  useShortTimeStyle() {
    this.timeStyle = "short"
  }

  string(date) {
    if (this.dateFormat) {
      return formatDatePattern(date, this.dateFormat, this.locale)
    }

    const options = {}

    if (this.dateStyle) {
      options.dateStyle = this.dateStyle
    }

    if (this.timeStyle) {
      options.timeStyle = this.timeStyle
    }

    return new Intl.DateTimeFormat(this.locale || undefined, options).format(date)
  }
}

function formatDatePattern(date, pattern, locale) {
  const lookup = {
    yyyy: () => String(date.getFullYear()),
    MMMM: () => new Intl.DateTimeFormat(locale || undefined, { month: "long" }).format(date),
    MMM: () => new Intl.DateTimeFormat(locale || undefined, { month: "short" }).format(date),
    EEEE: () => new Intl.DateTimeFormat(locale || undefined, { weekday: "long" }).format(date),
    EEE: () => new Intl.DateTimeFormat(locale || undefined, { weekday: "short" }).format(date),
    dd: () => String(date.getDate()).padStart(2, "0"),
    d: () => String(date.getDate()),
    HH: () => String(date.getHours()).padStart(2, "0"),
    H: () => String(date.getHours()),
    mm: () => String(date.getMinutes()).padStart(2, "0"),
  }

  return Object.keys(lookup)
    .sort((left, right) => right.length - left.length)
    .reduce((result, token) => result.replaceAll(token, lookup[token]()), pattern)
}

function applyPathToContext(ctx, path) {
  ctx.beginPath()

  for (const command of path.commands) {
    if (command.type === "move") {
      ctx.moveTo(command.point.x, command.point.y)
      continue
    }

    if (command.type === "line") {
      ctx.lineTo(command.point.x, command.point.y)
      continue
    }

    if (command.type === "roundedRect") {
      const { rect, radiusX, radiusY } = command
      roundRectPath(ctx, rect.x, rect.y, rect.width, rect.height, Math.min(radiusX, radiusY))
      continue
    }

    if (command.type === "ellipse") {
      const { rect } = command
      ctx.ellipse(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        rect.width / 2,
        rect.height / 2,
        0,
        0,
        Math.PI * 2
      )
    }
  }
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.quadraticCurveTo(x, y, x + safeRadius, y)
}

function createSymbolCanvas(symbolImage, width, height, tintColor = null) {
  const font = symbolImage.font || Font.systemFont(Math.min(width, height) * 0.85)
  const symbol = getSymbolGlyph(symbolImage.symbolName)
  const canvas = createCanvas(width, height)
  const canvasContext = canvas.getContext("2d")

  canvasContext.font = fontCss(font, symbol.fontFamily)
  canvasContext.fillStyle = (tintColor || symbolImage.tintColor || Color.white()).toRgba()
  canvasContext.textAlign = "center"
  canvasContext.textBaseline = "middle"
  canvasContext.fillText(symbol.glyph, width / 2, height / 2)

  return canvas
}

function drawSymbol(ctx, symbolImage, point) {
  const font = symbolImage.font || Font.systemFont(34)
  const size = Math.max(24, Math.round(font.size || 30))
  const canvas = createSymbolCanvas(symbolImage, size, size)
  ctx.drawImage(canvas, point.x, point.y, size, size)
}

function canvasImageToDataUri(canvas) {
  return `data:image/png;base64,${canvas.toBuffer("image/png").toString("base64")}`
}

class DrawContext {
  constructor(screenScale = DEFAULT_DRAW_CONTEXT_SCALE) {
    this.opaque = false
    this.respectScreenScale = true
    this._screenScale =
      Number.isFinite(screenScale) && screenScale > 0 ? screenScale : DEFAULT_DRAW_CONTEXT_SCALE
    this._size = new Size(0, 0)
    this._textColor = Color.white()
    this._fillColor = Color.white()
    this._strokeColor = Color.white()
    this._lineWidth = 1
    this._font = Font.systemFont(14)
    this._textAlignment = "left"
    this._path = null
    this._createCanvas()
  }

  set size(value) {
    this._size = value
    this._createCanvas()
  }

  get size() {
    return this._size
  }

  _createCanvas() {
    const width = Math.max(1, Math.round(this._size.width || 1))
    const height = Math.max(1, Math.round(this._size.height || 1))
    this.canvas = createCanvas(width, height)
    this.ctx = this.canvas.getContext("2d")
    this.ctx.textBaseline = "top"
  }

  setTextAlignedCenter() {
    this._textAlignment = "center"
    this.ctx.textAlign = "center"
  }

  setFont(font) {
    this._font = font
    this.ctx.font = fontCss(font)
  }

  setTextColor(color) {
    this._textColor = color
    this.ctx.fillStyle = color.toRgba()
  }

  setFillColor(color) {
    this._fillColor = color
    this.ctx.fillStyle = color.toRgba()
  }

  setStrokeColor(color) {
    this._strokeColor = color
    this.ctx.strokeStyle = color.toRgba()
  }

  setLineWidth(width) {
    this._lineWidth = width
    this.ctx.lineWidth = width
  }

  addPath(pathValue) {
    this._path = pathValue
  }

  fillPath() {
    if (!this._path) {
      return
    }

    this.ctx.save()
    this.ctx.fillStyle = this._fillColor.toRgba()
    applyPathToContext(this.ctx, this._path)
    this.ctx.fill()
    this.ctx.restore()
  }

  strokePath() {
    if (!this._path) {
      return
    }

    this.ctx.save()
    this.ctx.strokeStyle = this._strokeColor.toRgba()
    this.ctx.lineWidth = this._lineWidth
    applyPathToContext(this.ctx, this._path)
    this.ctx.stroke()
    this.ctx.restore()
  }

  drawText(text, point) {
    this.ctx.save()
    this.ctx.font = fontCss(this._font)
    this.ctx.fillStyle = this._textColor.toRgba()
    this.ctx.textAlign = this._textAlignment
    this.ctx.fillText(text, point.x, point.y)
    this.ctx.restore()
  }

  drawTextInRect(text, rect) {
    this.ctx.save()
    this.ctx.font = fontCss(this._font)
    this.ctx.fillStyle = this._textColor.toRgba()
    this.ctx.textAlign = this._textAlignment

    const textX = this._textAlignment === "center" ? rect.x + rect.width / 2 : rect.x

    this.ctx.fillText(text, textX, rect.y)
    this.ctx.restore()
  }

  drawImageAtPoint(image, point) {
    if (!image) {
      return
    }

    if (image.type === "symbol") {
      drawSymbol(this.ctx, image, point)
      return
    }

    if (image.type === "canvas-image") {
      this.ctx.drawImage(image.canvas, point.x, point.y)
    }
  }

  getImage() {
    const displayWidth = this.respectScreenScale ? this.canvas.width / this._screenScale : this.canvas.width
    const displayHeight =
      this.respectScreenScale ? this.canvas.height / this._screenScale : this.canvas.height

    return {
      type: "canvas-image",
      width: this.canvas.width,
      height: this.canvas.height,
      displayWidth,
      displayHeight,
      canvas: this.canvas,
      dataUri: canvasImageToDataUri(this.canvas),
    }
  }
}

class WidgetText {
  constructor(text) {
    this.type = "text"
    this.text = text
    this.font = Font.systemFont(14)
    this.textColor = Color.white()
    this.textAlignment = "left"
  }

  rightAlignText() {
    this.textAlignment = "right"
  }

  centerAlignText() {
    this.textAlignment = "center"
  }

  leftAlignText() {
    this.textAlignment = "left"
  }

  toJSON() {
    return {
      type: this.type,
      text: this.text,
      font: this.font,
      textColor: this.textColor,
      textAlignment: this.textAlignment,
    }
  }
}

class WidgetImage {
  constructor(image) {
    this.type = "image"
    this.image = image
    this.imageSize = null
    this.tintColor = null
  }

  toJSON() {
    return {
      type: this.type,
      image: serializeImage(this.image),
      imageSize: this.imageSize,
      tintColor: this.tintColor,
    }
  }
}

class WidgetSpacer {
  constructor(length = null) {
    this.type = "spacer"
    this.length = length
  }

  toJSON() {
    return { type: this.type, length: this.length }
  }
}

class WidgetStack {
  constructor(kind = "stack") {
    this.type = kind
    this.children = []
    this.layout = "vertical"
    this.padding = { top: 0, right: 0, bottom: 0, left: 0 }
    this.spacing = 0
    this.size = new Size(0, 0)
    this.url = null
    this.borderWidth = 0
    this.backgroundColor = null
    this.centerContent = false
    this.contentAlignment = "stretch"
  }

  addStack() {
    const stack = new WidgetStack()
    this.children.push(stack)
    return stack
  }

  addText(text) {
    const item = new WidgetText(text)
    this.children.push(item)
    return item
  }

  addImage(image) {
    const item = new WidgetImage(image)
    this.children.push(item)
    return item
  }

  addSpacer(length = null) {
    const spacer = new WidgetSpacer(length)
    this.children.push(spacer)
    return spacer
  }

  layoutHorizontally() {
    this.layout = "horizontal"
  }

  layoutVertically() {
    this.layout = "vertical"
  }

  setPadding(top, right, bottom, left) {
    this.padding = { top, right, bottom, left }
  }

  centerAlignContent() {
    this.centerContent = true
    this.contentAlignment = "center"
  }

  toJSON() {
    return {
      type: this.type,
      layout: this.layout,
      padding: this.padding,
      spacing: this.spacing,
      size: this.size,
      url: this.url,
      borderWidth: this.borderWidth,
      backgroundColor: this.backgroundColor,
      centerContent: this.centerContent,
      contentAlignment: this.contentAlignment,
      children: this.children.map((child) => child.toJSON()),
    }
  }
}

class ListWidget extends WidgetStack {
  constructor() {
    super("widget")
    this.backgroundColor = null
    this.backgroundGradient = null
    this.backgroundImage = null
  }

  async presentLarge() {}

  async presentMedium() {}

  async presentSmall() {}

  toJSON() {
    return {
      ...super.toJSON(),
      backgroundColor: this.backgroundColor,
      backgroundGradient: this.backgroundGradient,
      backgroundImage: serializeImage(this.backgroundImage),
    }
  }
}

class SFSymbol {
  constructor(name) {
    this.name = name
    this.font = Font.systemFont(24)
  }

  applyFont(font) {
    this.font = font
  }

  get image() {
    return {
      type: "symbol",
      symbolName: this.name,
      font: this.font,
      tintColor: null,
    }
  }

  static named(name) {
    return new SFSymbol(name)
  }
}

function serializeImage(image) {
  if (!image) {
    return null
  }

  if (image.type === "canvas-image") {
    return {
      type: image.type,
      width: image.width,
      height: image.height,
      displayWidth: image.displayWidth,
      displayHeight: image.displayHeight,
      dataUri: image.dataUri,
    }
  }

  if (image.type === "symbol") {
    return {
      type: image.type,
      symbolName: image.symbolName,
    }
  }

  if (image.type === "file-image") {
    return {
      type: image.type,
      width: image.width,
      height: image.height,
      dataUri: image.dataUri,
    }
  }

  return image
}

function buildMockWeather(options) {
  const now = new Date()
  const currentHour = new Date(now)
  currentHour.setMinutes(0, 0, 0)

  const currentTemp = 12
  const baseConditions = [800, 801, 802, 500, 500, 803, 800, 800, 801, 500, 803, 804]

  const hourly = Array.from({ length: 24 }, (_, index) => {
    const timestamp = new Date(currentHour.getTime() + index * 60 * 60 * 1000)
    const temp = 10 + Math.sin((index / 24) * Math.PI * 2) * 5 + (index > 12 ? -1 : 1)
    return {
      dt: Math.floor(timestamp.getTime() / 1000),
      temp,
      dew_point: temp - 2,
      humidity: 65 + (index % 4) * 6,
      pressure: 1012 + (index % 5),
      clouds: 10 + ((index * 13) % 70),
      uvi: Math.max(0, 4 - Math.abs(12 - index) * 0.4),
      wind_speed: 3.1 + (index % 5) * 0.8,
      pop: index % 5 === 0 ? 0.45 : 0.12,
      weather: [
        {
          id: baseConditions[index % baseConditions.length],
          description: index < 8 ? "klar" : "leicht bewoelkt",
        },
      ],
    }
  })

  const daily = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() + index)
    const max = 12 + Math.sin(index * 0.8) * 4
    const min = max - 6 - (index % 2)
    return {
      dt: Math.floor(date.getTime() / 1000),
      sunrise: Math.floor(
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 45).getTime() / 1000
      ),
      sunset: Math.floor(
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 20).getTime() / 1000
      ),
      temp: {
        min,
        max,
      },
      pop: index % 3 === 0 ? 0.35 : 0.1,
      weather: [
        {
          id: baseConditions[(index + 2) % baseConditions.length],
          description: index % 2 === 0 ? "teilweise sonnig" : "bedeckt",
        },
      ],
    }
  })

  return {
    lat: options.location.latitude,
    lon: options.location.longitude,
    timezone: "Europe/Berlin",
    current: {
      dt: Math.floor(now.getTime() / 1000),
      sunrise: daily[0].sunrise,
      sunset: daily[0].sunset,
      temp: currentTemp,
      feels_like: 10,
      dew_point: 7,
      humidity: 72,
      pressure: 1014,
      clouds: 38,
      uvi: 2.9,
      wind_speed: 4.2,
      weather: [{ id: 800, description: "klar" }],
    },
    hourly,
    daily,
    alerts: options.showAlerts
      ? [{ event: "Mock Alert", description: "Regen am Abend moeglich." }]
      : undefined,
  }
}

function buildMockSunrise() {
  const now = new Date()
  const sunrise = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 45)
  const sunset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 20)
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 43)

  return {
    results: {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
      tomorrow: tomorrow.toISOString(),
    },
  }
}

class Request {
  constructor(url) {
    this.url = url
  }

  async loadJSON() {
    if (this.url.includes("/data/3.0/onecall")) {
      if (this.runtime.options.useMockWeather) {
        return buildMockWeather(this.runtime.options)
      }
    }

    if (this.url.includes("sunrise-sunset.org")) {
      if (this.runtime.options.useMockWeather) {
        return buildMockSunrise(this.runtime.options)
      }
    }

    const response = await fetch(this.url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fuer ${this.url}`)
    }

    return response.json()
  }

  async load() {
    if (this.url === "https://openweathermap.org") {
      return Buffer.from("ok")
    }

    const response = await fetch(this.url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fuer ${this.url}`)
    }

    return Buffer.from(await response.arrayBuffer())
  }
}

class FileManager {
  constructor(baseDir) {
    this.baseDir = baseDir
  }

  documentsDirectory() {
    return this.baseDir
  }

  joinPath(...parts) {
    return path.join(...parts)
  }

  fileExists(filePath) {
    return require("fs").existsSync(filePath)
  }

  readString(filePath) {
    return require("fs").readFileSync(filePath, "utf8")
  }

  writeString(filePath, value) {
    require("fs").mkdirSync(path.dirname(filePath), { recursive: true })
    require("fs").writeFileSync(filePath, value, "utf8")
  }

  readImage(filePath) {
    const buffer = require("fs").readFileSync(filePath)
    return {
      type: "file-image",
      width: 0,
      height: 0,
      dataUri: `data:image/${path.extname(filePath).slice(1) || "png"};base64,${buffer.toString("base64")}`,
      buffer,
    }
  }

  writeImage(filePath, image) {
    require("fs").mkdirSync(path.dirname(filePath), { recursive: true })

    if (image?.type === "canvas-image") {
      require("fs").writeFileSync(filePath, image.canvas.toBuffer("image/png"))
      return
    }

    if (image?.buffer) {
      require("fs").writeFileSync(filePath, image.buffer)
    }
  }

  modificationDate(filePath) {
    return require("fs").statSync(filePath).mtime
  }

  static local() {
    throw new Error("FileManager.local() muss ueber den Runtime-Kontext gebunden werden.")
  }
}

class Runtime {
  constructor(options) {
    this.options = {
      widgetFamily: options.widgetFamily || "large",
      widgetSizes: options.widgetSizes || {},
      locale: options.locale || "de-DE",
      useMockWeather: options.useMockWeather !== false,
      location: options.location || {
        latitude: 52.52,
        longitude: 13.405,
        locality: "Berlin",
      },
      scriptPath: options.scriptPath,
      showAlerts: Boolean(options.showAlerts),
    }
    this.widget = null
    this.documentsDir = path.join(path.dirname(this.options.scriptPath), ".scriptable-documents")
  }

  async run() {
    await fs.mkdir(this.documentsDir, { recursive: true })
    const source = await fs.readFile(this.options.scriptPath, "utf8")
    const wrappedSource = `(async () => {\n${source}\n})()`
    const sandbox = this.createSandbox()
    const context = vm.createContext(sandbox)
    const script = new vm.Script(wrappedSource, { filename: this.options.scriptPath })
    await script.runInContext(context)
  }

  createSandbox() {
    const runtime = this
    const fileManager = new FileManager(this.documentsDir)

    function importModule(moduleName) {
      const baseDir = path.dirname(runtime.options.scriptPath)
      const normalizedPath = moduleName.endsWith(".js") ? moduleName : `${moduleName}.js`
      const resolvedPath = path.isAbsolute(normalizedPath)
        ? normalizedPath
        : path.resolve(baseDir, normalizedPath)

      delete require.cache[resolvedPath]
      return require(resolvedPath)
    }

    class BoundRequest extends Request {
      constructor(url) {
        super(url)
        this.runtime = runtime
      }
    }

    class BoundFileManager extends FileManager {
      static local() {
        return fileManager
      }
    }

    const Script = {
      setWidget: (widget) => {
        runtime.widget = widget
      },
      complete: () => {},
    }

    const Device = {
      locale: () => runtime.options.locale,
    }

    const Location = {
      current: async () => ({
        latitude: runtime.options.location.latitude,
        longitude: runtime.options.location.longitude,
      }),
      reverseGeocode: async () => [{ locality: runtime.options.location.locality }],
    }

    const Photos = {
      fromLibrary: async () => ({
        type: "canvas-image",
        width: 1,
        height: 1,
        canvas: createCanvas(1, 1),
        dataUri:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9quNQAAAAASUVORK5CYII=",
      }),
    }

    return {
      console,
      fetch,
      Color,
      Font,
      Size,
      Point,
      Rect,
      Path,
      DrawContext: class BoundDrawContext extends DrawContext {
        constructor() {
          super()
        }
      },
      ListWidget,
      LinearGradient,
      DateFormatter,
      Request: BoundRequest,
      Device,
      FileManager: BoundFileManager,
      Location,
      Photos,
      SFSymbol,
      Script,
      importModule,
      config: {
        widgetFamily: runtime.options.widgetFamily,
      },
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    }
  }
}

function gradientCss(gradient) {
  if (!gradient || !gradient.colors?.length) {
    return "none"
  }

  const parts = gradient.colors.map((color, index) => {
    const location = gradient.locations?.[index]
    if (location === undefined) {
      return color.toRgba()
    }

    return `${color.toRgba()} ${Math.round(location * 100)}%`
  })

  return `linear-gradient(180deg, ${parts.join(", ")})`
}

function colorCss(color) {
  return color ? color.toRgba() : "transparent"
}

function imageDataUri(image, imageSize, tintColor) {
  if (!image) {
    return ""
  }

  if (image.type === "canvas-image" || image.type === "file-image") {
    return image.dataUri
  }

  if (image.type === "symbol") {
    const width = Math.max(24, Math.round(imageSize?.width || image.font?.size || 30))
    const height = Math.max(24, Math.round(imageSize?.height || image.font?.size || 30))
    const canvas = createSymbolCanvas(image, width, height, tintColor)
    return canvasImageToDataUri(canvas)
  }

  return ""
}

function isContainerNode(node) {
  return node?.type === "stack" || node?.type === "widget"
}

function isFlexibleMainAxisChild(node, parentLayout) {
  if (!isContainerNode(node)) {
    return false
  }

  if (parentLayout === "horizontal") {
    return !(node.size?.width > 0)
  }

  return false
}

function getContentAlignment(node) {
  if (node?.contentAlignment) {
    return node.contentAlignment
  }

  return node?.centerContent ? "center" : "stretch"
}

function renderNode(node, parentLayout = "vertical") {
  if (node.type === "text") {
    const font = node.font || Font.systemFont(14)
    return `<div class="widget-text" style="font:${font.toCss()};color:${node.textColor.toRgba()};text-align:${node.textAlignment};">${escapeHtml(node.text)}</div>`
  }

  if (node.type === "image") {
    const resolvedWidth = node.imageSize?.width || node.image?.displayWidth
    const resolvedHeight = node.imageSize?.height || node.image?.displayHeight
    const width = resolvedWidth ? `width:${resolvedWidth}px;` : "width:auto;"
    const height = resolvedHeight ? `height:${resolvedHeight}px;` : "height:auto;"
    const src = imageDataUri(node.image, node.imageSize, node.tintColor)
    return `<img class="widget-image" alt="" src="${src}" style="${width}${height}max-width:100%;display:block;" />`
  }

  if (node.type === "spacer") {
    if (node.length == null) {
      return `<div class="widget-spacer" style="flex:1 1 auto;"></div>`
    }

    const sizeStyle =
      parentLayout === "horizontal"
        ? `width:${node.length}px;min-width:${node.length}px;`
        : `height:${node.length}px;min-height:${node.length}px;`

    return `<div class="widget-spacer" style="flex:0 0 auto;${sizeStyle}"></div>`
  }

  const isWidget = node.type === "widget"
  const direction = node.layout === "horizontal" ? "row" : "column"
  const flexStyle = isWidget
    ? ""
    : isFlexibleMainAxisChild(node, parentLayout)
      ? "flex:1 1 0;min-width:0;"
      : "flex:0 0 auto;"
  const sizeStyle = [
    node.size?.width > 0 ? `width:${node.size.width}px;` : "",
    node.size?.height > 0 ? `height:${node.size.height}px;` : "",
  ].join("")
  const padding = node.padding || { top: 0, right: 0, bottom: 0, left: 0 }
  const contentAlignment = getContentAlignment(node)
  const alignItems =
    contentAlignment === "center"
      ? "center"
      : contentAlignment === "right"
        ? "flex-end"
        : contentAlignment === "left"
          ? "flex-start"
          : "stretch"
  const blockStyle = [
    `display:flex`,
    `flex-direction:${direction}`,
    `gap:${node.spacing || 0}px`,
    `padding:${clampPadding(padding.top)}px ${clampPadding(padding.right)}px ${clampPadding(padding.bottom)}px ${clampPadding(padding.left)}px`,
    `align-items:${alignItems}`,
    flexStyle,
    sizeStyle,
    node.backgroundColor ? `background:${colorCss(node.backgroundColor)}` : "",
  ]
    .filter(Boolean)
    .join(";")
  const childrenHtml = node.children.map((child) => renderNode(child, node.layout)).join("")
  const tag = isWidget ? "section" : node.url ? "a" : "div"
  const href = node.url ? ` href="${escapeHtml(node.url)}" target="_blank" rel="noreferrer"` : ""

  return `<${tag} class="widget-block ${isWidget ? "widget-root" : "widget-stack"}"${href} style="${blockStyle}">${childrenHtml}</${tag}>`
}

async function renderWidgetToHtml(widget, options) {
  const familySize = widgetSizeForFamily(options.family, options.widgetSizes)
  const background = widget.backgroundImage
    ? `background-image:url('${imageDataUri(widget.backgroundImage)}');background-size:cover;background-position:center;`
    : widget.backgroundGradient
      ? `background:${gradientCss(widget.backgroundGradient)};`
      : widget.backgroundColor
        ? `background:${colorCss(widget.backgroundColor)};`
        : "background:#0b1320;"

  const widgetHtml = renderNode(widget)

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --page-bg: #10151d;
      --card-shadow: 0 32px 80px rgba(0, 0, 0, 0.35);
      --frame: rgba(255, 255, 255, 0.08);
      --text: #f4f7fb;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at top, rgba(74, 113, 164, 0.28), transparent 38%),
        linear-gradient(180deg, #0a0f17 0%, #111b29 100%);
      color: var(--text);
      font-family: system-ui, sans-serif;
      padding: 32px 16px;
    }

    .preview-shell {
      display: grid;
      gap: 18px;
      justify-items: center;
    }

    .preview-title {
      font-size: 13px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.62);
    }

    .widget-frame {
      width: ${familySize.width}px;
      min-height: ${familySize.height}px;
      border-radius: 32px;
      padding: 0;
      border: 1px solid var(--frame);
      box-shadow: var(--card-shadow);
      overflow: hidden;
      ${background}
    }

    .widget-root {
      width: 100%;
      min-height: ${familySize.height}px;
      text-decoration: none;
    }

    .widget-stack {
      max-width: 100%;
      min-width: 0;
    }

    .widget-text {
      display: block;
      white-space: nowrap;
      line-height: 1.1;
      min-width: 0;
    }

    .widget-image {
      object-fit: contain;
    }

    a.widget-stack,
    a.widget-root {
      color: inherit;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="preview-shell">
    <div class="preview-title">Scriptable Preview (${escapeHtml(options.family)})</div>
    <div class="widget-frame">${widgetHtml}</div>
  </div>
</body>
</html>`
}

async function createRuntime(options) {
  return new Runtime(options)
}

module.exports = {
  createRuntime,
  renderWidgetToHtml,
}
