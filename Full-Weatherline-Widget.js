// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: sun;
// 

// by italoboy and tnx to Max Zeryck for the original code

// Special tnx to thewaytozion for creating this idea.
// Special tnx to P Jai Rjlin for assisting.

/// <reference path="./node_modules/@types/scriptable-ios/index.d.ts" />

/*
 * SETUP
 * Edit this section to change API key, units, colors, and behavior.
 * ================================================================
 */

// Get a free API key at https://openweathermap.org/appid
const apiKey = ""

// Language code for weather descriptions and date labels.
// Leave blank ("") to use the device's language automatically.
// Examples: "en", "de"
let locale = ""

// URL to open when the widget is tapped.
// Leave blank to open the default weather.com page for your location.
const externalLink = ""

// true  = GPS is only read once, then the result is cached.
// false = location is refreshed on every widget update.
const lockLocation = true

// Preview size when running the script directly in the Scriptable app.
// Has no effect on the actual home screen widget. Values: "large" | "medium"
const widgetPreview = "large"

// true  = use a photo from your library as a transparent background.
// false = use the built-in time-of-day gradient.
const imageBackground = false

// Set to true once to trigger a new photo selection, then set back to false.
const forceImageUpdate = false

// Padding (in points) added around each widget item.
const padding = 0

// Number of hours shown in the hourly chart.
const hoursToShow = 8

// Number of days shown in the daily chart.
const daysToShow = 4

// Round temperature values to whole numbers in the chart line.
const roundedGraph = true

// Round displayed temperature numbers throughout the widget.
const roundedTemp = true

// true = 12-hour clock (AM/PM) in sunrise/sunset labels and data rows.
const _12Hours = false

// true = 12-hour clock for hour labels inside the hourly diagram.
const diagram12Hours = false

// Show active weather alerts at the bottom of the widget.
const showAlerts = true

// Enable drop shadows on text and chart lines for a more dimensional look.
const showShadows = false

const sunriseSettings = {
  // How many minutes before or after sunrise/sunset the sunrise element is shown.
  // Set to 0 to always show it regardless of time of day.
  showWithin: 0,
}

const weatherSettings = {
  // "metric"   -> C, m/s, hPa
  // "imperial" -> F, mph, inHg
  units: "metric",
}

// Save the last raw weather response to Scriptable documents for debugging.
const saveWeatherApiResponse = true

// Base palette for the entire widget.
const palette = {
  textPrimary: "#F8FAFC",
  textSecondary: "#DCE3EA",
  textMuted: "#C7D0D9",
  line: "#E2E8F0",
  night: "#B7C2CC",
  accent: "#FFC857",
  rain: "#7DD3FC",
  warning: "#FFE08A",
}

// Fonts: use a system weight such as "light", "regular", or "bold".
// Colors: 6-digit hex without the leading #. Leave blank to inherit defaultText.
const textFormat = {
  defaultText: { size: 14, color: palette.textPrimary.slice(1), font: "regular" },

  largeTemp: { size: 34, color: "", font: "light" },
  smallTemp: { size: 14, color: "", font: "" },
  tinyTemp: { size: 12, color: "", font: "" },

  customText: { size: 10, color: palette.textSecondary.slice(1), font: "light" },

  smallDate: { size: 14, color: "", font: "semibold" },
  largeDate1: { size: 30, color: "", font: "light" },
  largeDate2: { size: 26, color: "", font: "semibold" },
  sunrise: { size: 14, color: "", font: "medium" },

  location: { size: 14, color: "", font: "semibold", opacity: 1 },
  desconly: { size: 12, color: "", font: "regular", opacity: 1 },
  HiLotemp: { size: 12, color: "", font: "regular", opacity: 1 },
  databtm: { size: 10, color: palette.textPrimary.slice(1), font: "bold", opacity: 1 },
  databtmtxt: { size: 10, color: palette.textSecondary.slice(1), font: "regular", opacity: 1 },
  updatetxt: { size: 8, color: palette.textMuted.slice(1), font: "light", opacity: 1 },
  warning: { size: 12, color: palette.warning.slice(1), font: "bold" },
  alertstxt: { size: 10, color: palette.accent.slice(1), font: "bold", opacity: 1 },
}

// Accent colors built from the palette hex values.
const accentColor = new Color(palette.accent, 1)
const nightColor = new Color(palette.night, 1)
const linecolor = new Color(palette.line, 1)
const rainColor = new Color(palette.rain, 1)

// Shadow overlays — opacity is 0 when showShadows is false.
const shadowOpacity = showShadows ? 1 : 0
const shadow1 = new Color("#111111", 0.4 * shadowOpacity)
const shadow2 = new Color("#111111", 0.2 * shadowOpacity)
const shadow3 = new Color("#111111", 0.1 * shadowOpacity)

const diagramSettings = {
  canvas: {
    width: 665,
    height: 260,
  },
  shared: {
    fromLeft: 50,
    topRuleY: 15,
    bottomRuleY: 255,
    graphLineY: 176,
    graphShadowLowY: 177,
    graphHighlightY: 175,
    verticalBottomY: 215,
    verticalHeightOffset: 40,
    iconY: 155,
    labelY: 220,
    heightDiff: 80,
  },
  hourly: {
    verticalXOffset: 2,
    iconXOffset: 33,
    labelXOffset: 25,
    labelWidth: 50,
    labelHeight: 21,
    currentTemp: {
      fontSize: 40,
      xOffset: 12,
      y: 112,
      width: 100,
      height: 42,
    },
    forecastTemp: {
      fontSize: 20,
      xOffset: 32,
      y: 130,
      width: 50,
      height: 21,
    },
  },
  daily: {
    verticalXOffset: 2,
    iconXOffset: 33,
    textXOffset: 32,
    labelXOffset: 25,
    labelWidth: 55,
    labelHeight: 21,
    tempFontSize: 20,
    tempWidth: 50,
    tempHeight: 21,
    maxTempY: 130,
    minTempY: 195,
  },
}

let drawContext = createDiagramContext()

/*
 * LAYOUT
 * Decide what items to show on the widget.
 * ========================================
 */

// You always need to start with "row," and "column," items, but you can now add as many as you want.
// Adding left, right, or center will align everything after that. The default alignment is left.

// You can add a flexible vertical space with "space," or a fixed-size space like this: "space(50)"
// Align items to the top or bottom of columns by adding "space," before or after all items in the column.

// There are many possible items, including: date, greeting, events, current, future, battery, sunrise, and text("Your text here")
// Make sure to always put a comma after each item.

// prettier-ignore
const items = [
  row(17),
    column,      left,   currentLoc,
    column,      center,     space,
    column,      right,  maxtemp,

  row(13),
    column,        left,   desconly,
    column,        center, offline,
    column,        right,  mintemp,

  row(130),
    column,   center,   drawdiagram,

  row(130),
    column,   center,   drawdiagramdaily,

  row,
    column(80),  left,  feelsliketxt,
    column(80),  right, feelslike,
    column(10),
    column(80),  left,  sunriseonlytxt,
    column(80),  right, sunriseonly,

  row,
    column(80),  left,  raintxt,
    column(80),  right, rain,
    column(10),
    column(80),  left,  sunsetonlytxt,
    column(80),  right, sunsetonly,

  row,
    column(80),  left,  dewpointtxt,
    column(80),  right, dewpoint,
    column(10),
    column(80),  left,  windtxt,
    column(80),  right, wind,

  row,
    column(80),  left,  humiditytxt,
    column(80),  right, humidity,
    column(10),
    column(80),  left,  UVIndextxt,
    column(80),  right, UVIndex,

  row,
    column(80), left,  pressuretxt,
    column(80), right, pressure,
    column(10),
    column(80), left,  cloudstxt,
    column(80), right, clouds,

  row,
    column(160), left,  alerts,
    column(10),
    column(160), right, updatedtime,

  row,
    column,
    space,
]

if (widgetPreview === "small" || config.widgetFamily === "small") {
  throw (locale || Device.locale()).toLowerCase().startsWith("de")
    ? "Widget-Groesse wird nicht unterstuetzt"
    : "Widget size not supported"
}

// Medium size: remove the detail rows below both diagrams.
if (widgetPreview === "medium" || config.widgetFamily === "medium") {
  items.splice(23, 80)
}

const i18n = {
  de: {
    labels: {
      max: "Max:",
      min: "Min:",
      update: "Update:",
      sunset: "Sonnenuntergang",
      sunrise: "Sonnenaufgang",
      feelsLike: "gefühlt",
      rain: "Regen",
      dewPoint: "Taupunkt",
      humidity: "Luftfeuchte",
      pressure: "Druck",
      wind: "Wind",
      uvIndex: "UV-Index",
      clouds: "Wolken",
    },
    diagram: {
      now: "Jetzt",
      today: "Heute",
      weekdays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    },
    alerts: {
      additionalOne: "weitere Warnung",
      additionalMany: "weitere Warnungen",
    },
    errors: {
      unsupportedWidgetSize: "Widget-Größe wird nicht unterstützt",
      noOfflineCache: "Kein Cache gespeichert und offline",
      missingSolarData: "Wetterdaten enthalten keine Sonnenauf- und Untergangsdaten",
      invalidWeatherData: "OpenWeather hat unvollständige Wetterdaten geliefert",
      weatherApiError: "OpenWeather-Fehler",
    },
    conditions: {
      clearSky: "Klarer Himmel",
      fewClouds: "Leicht bewölkt",
      scatteredClouds: "Aufgelockerte Bewölkung",
      brokenClouds: "Stark bewölkt",
      overcastClouds: "bedeckt",
      thunderstorm: "Gewitter",
      drizzle: "Nieselregen",
      rain: "Regen",
      freezingRain: "gefrierender Regen",
      snow: "Schnee",
      sleet: "Schneeregen",
      atmosphere: "Dunst",
      mist: "Nebel",
      smoke: "Rauch",
      haze: "Dunst",
      fog: "Nebel",
      dust: "Staubig",
      ash: "Vulkanasche",
      squalls: "Boeen",
      tornado: "Tornado",
      cloudy: "Wolkig",
    },
    date: {
      smallDateFormat: "EEEE, d. MMMM",
      largeDateLineOne: "EEEE,",
      largeDateLineTwo: "d. MMMM",
    },
    windDirections: [
      "N",
      "NNO",
      "NO",
      "ONO",
      "O",
      "OSO",
      "SO",
      "SSO",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ],
  },
  en: {
    labels: {
      max: "Max:",
      min: "Min:",
      update: "Update:",
      sunset: "Sunset",
      sunrise: "Sunrise",
      feelsLike: "Feels Like",
      rain: "Rain",
      dewPoint: "Dew Point",
      humidity: "Humidity",
      pressure: "Pressure",
      wind: "Wind",
      uvIndex: "UV-Index",
      clouds: "Clouds",
    },
    diagram: {
      now: "Now",
      today: "Today",
      weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    },
    alerts: {
      additionalOne: "more alert",
      additionalMany: "more alerts",
    },
    errors: {
      unsupportedWidgetSize: "Widget size not supported",
      noOfflineCache: "No cache saved but you are offline",
      missingSolarData: "Weather data does not contain sunrise/sunset information",
      invalidWeatherData: "OpenWeather returned incomplete weather data",
      weatherApiError: "OpenWeather error",
    },
    conditions: {
      clearSky: "Clear sky",
      fewClouds: "Few clouds",
      scatteredClouds: "Scattered clouds",
      brokenClouds: "Broken clouds",
      overcastClouds: "Overcast clouds",
      thunderstorm: "Thunderstorm",
      drizzle: "Drizzle",
      rain: "Rain",
      freezingRain: "Freezing rain",
      snow: "Snow",
      sleet: "Sleet",
      atmosphere: "Haze",
      mist: "Mist",
      smoke: "Smoke",
      haze: "Haze",
      fog: "Fog",
      dust: "Dust",
      ash: "Volcanic ash",
      squalls: "Squalls",
      tornado: "Tornado",
      cloudy: "Cloudy",
    },
    date: {
      smallDateFormat: "EEEE, MMMM d",
      largeDateLineOne: "EEEE,",
      largeDateLineTwo: "MMMM d",
    },
    windDirections: [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ],
  },
}

/*
 * WIDGET CODE
 * Be more careful editing this section.
 * =====================================
 */

// Make sure we have a locale value.
if (locale == "" || locale == null) {
  locale = Device.locale()
}

const languageCode = getLanguageCode(locale)
const strings = i18n[languageCode] || i18n.en
const dateSettings = {
  staticDateSize: "small",
  smallDateFormat: strings.date.smallDateFormat,
  largeDateLineOne: strings.date.largeDateLineOne,
  largeDateLineTwo: strings.date.largeDateLineTwo,
}

// Mutable runtime flag: tracks whether the current rendering context is night-time.
// Updated by isNight() and temporarily overridden by drawConditionSymbol().
let night = true

// Lazy-loaded data caches — populated on first access by their respective setup functions.
let locationData, solarData, weatherData

// Create global constants.
const currentDate = new Date()
const files = FileManager.local()

/*
 * CONSTRUCTION
 * ============
 */

// Set up the widget with padding.
const widget = new ListWidget()

externalLink && (widget.url = externalLink)

widget.setPadding(3, 10, -3, 10)
widget.spacing = -1.2

// Set up the global variables.
var currentRow = {}
var currentColumn = {}

// Set up the initial alignment.
var currentAlignment = alignLeft

// Set up the global ASCII variables.
var currentColumns = []
var rowNeedsSetup = false

// It's ASCII time!
if (typeof items[0] == "string") {
  for (const line of items[0].split(/\r?\n/)) {
    await processLine(line)
  }
}

// Otherwise, set up normally.
else {
  for (const item of items) {
    await item(currentColumn)
  }
}

/*
 * BACKGROUND DISPLAY
 * ==================
 */

if (imageBackground) {
  const path = files.joinPath(files.documentsDirectory(), "weather-cal-image-eric")
  const exists = files.fileExists(path)

  if (exists && !forceImageUpdate) {
    widget.backgroundImage = files.readImage(path)
  } else if (!exists && !forceImageUpdate) {
    widget.backgroundColor = Color.gray()
  } else {
    const img = await Photos.fromLibrary()
    widget.backgroundImage = img
    files.writeImage(path, img)
  }
} else {
  let gradient = new LinearGradient()
  let gradientSettings = await setupGradient()
  gradient.colors = gradientSettings.color()
  gradient.locations = gradientSettings.position()

  widget.backgroundGradient = gradient
}

Script.setWidget(widget)
if (["medium", "large"].includes(widgetPreview)) {
  widget["present" + widgetPreview.charAt(0).toUpperCase() + widgetPreview.slice(1)]()
}
Script.complete()

// Processes a single line of ASCII.
async function processLine(lineInput) {
  // Because iOS loves adding periods to everything.
  const line = lineInput.replace(/\.+/g, "")

  // If it's blank, return.
  if (line.trim() == "") {
    return
  }

  // If it's a line, enumerate previous columns (if any) and set up the new row.
  if (line[0] == "-" && line[line.length - 1] == "-") {
    if (currentColumns.length > 0) {
      await enumerateColumns()
    }
    rowNeedsSetup = true
    return
  }

  // If it's the first content row, finish the row setup.
  if (rowNeedsSetup) {
    row(currentColumn)
    rowNeedsSetup = false
  }

  // If there's a number, this is a setup row.
  const setupRow = line.match(/\d+/)

  // Otherwise, it has columns.
  const items = line.split("|")

  // Iterate through each item.
  for (var i = 1; i < items.length - 1; i++) {
    // If the current column doesn't exist, make it.
    if (!currentColumns[i]) {
      currentColumns[i] = { items: [] }
    }

    // Now we have a column to add the items to.
    const column = currentColumns[i].items

    // Get the current item and its trimmed version.
    const item = items[i]
    const trim = item.trim()

    // If it's not a function, figure out spacing.
    if (!provideFunction(trim)) {
      // If it's a setup row, whether or not we find the number, we keep going.
      if (setupRow) {
        const value = parseInt(trim, 10)
        if (value) {
          currentColumns[i].width = value
        }
        continue
      }

      // If it's blank and we haven't already added a space, add one.
      const prevItem = column[column.length - 1]
      if (trim == "" && (!prevItem || (prevItem && !prevItem.startsWith("space")))) {
        column.push("space")
      }

      // Either way, we're done.
      continue
    }

    // Determine the alignment.
    const index = item.indexOf(trim)
    const length = item.slice(index, item.length).length

    let align
    if (index > 0 && length > trim.length) {
      align = "center"
    } else if (index > 0) {
      align = "right"
    } else {
      align = "left"
    }

    // Add the items to the column.
    column.push(align)
    column.push(trim)
  }
}

// Runs the function names in each column.
async function enumerateColumns() {
  if (currentColumns.length > 0) {
    for (const col of currentColumns) {
      // If it's null, go to the next one.
      if (!col) {
        continue
      }

      // If there's a width, use the width function.
      if (col.width) {
        column(col.width)(currentColumn)

        // Otherwise, create the column normally.
      } else {
        column(currentColumn)
      }
      for (const item of col.items) {
        const func = provideFunction(item)()
        await func(currentColumn)
      }
    }
    currentColumns = []
  }
}

/*
 * LAYOUT FUNCTIONS
 * These functions manage spacing and alignment.
 * =============================================
 */

// Makes a new row on the widget.
function row(input = null) {
  function makeRow() {
    currentRow = widget.addStack()
    currentRow.layoutHorizontally()
    currentRow.setPadding(0, 0, 0, 0)
    currentColumn.spacing = 0

    // If input was given, make a column of that size.
    if (input > 0) {
      currentRow.size = new Size(0, input)
    }
  }

  // If there's no input or it's a number, it's being called in the layout declaration.
  if (!input || typeof input == "number") {
    return makeRow
  }

  // Otherwise, it's being called in the generator.
  else {
    makeRow()
  }
}

// Makes a new column on the widget.
function column(input = null) {
  function makeColumn() {
    currentColumn = currentRow.addStack()
    currentColumn.layoutVertically()
    currentColumn.setPadding(0, 0, 0, 0)
    currentColumn.spacing = 0

    // If input was given, make a column of that size.
    if (input > 0) {
      currentColumn.size = new Size(input, 0)
    }
  }

  // If there's no input or it's a number, it's being called in the layout declaration.
  if (!input || typeof input == "number") {
    return makeColumn
  }

  // Otherwise, it's being called in the generator.
  else {
    makeColumn()
  }
}

// Create an aligned stack to add content to.
function align(column) {
  // Add the containing stack to the column.
  let alignmentStack = column.addStack()
  alignmentStack.layoutHorizontally()

  // Get the correct stack from the alignment function.
  let returnStack = currentAlignment(alignmentStack)
  returnStack.layoutVertically()

  if (currentAlignment === alignRight) {
    returnStack.contentAlignment = "right"
  } else if (currentAlignment === alignCenter) {
    returnStack.contentAlignment = "center"
  }

  return returnStack
}

// Create a right-aligned stack.
function alignRight(alignmentStack) {
  alignmentStack.addSpacer()
  let returnStack = alignmentStack.addStack()
  return returnStack
}

// Create a left-aligned stack.
function alignLeft(alignmentStack) {
  let returnStack = alignmentStack.addStack()
  alignmentStack.addSpacer()
  return returnStack
}

// Create a center-aligned stack.
function alignCenter(alignmentStack) {
  alignmentStack.addSpacer()
  let returnStack = alignmentStack.addStack()
  alignmentStack.addSpacer()
  return returnStack
}

// This function adds a space, with an optional amount.
function space(input = null) {
  // This function adds a spacer with the input width.
  function spacer(column) {
    // If the input is null or zero, add a flexible spacer.
    if (!input || input == 0) {
      column.addSpacer()
    }

    // Otherwise, add a space with the specified length.
    else {
      column.addSpacer(input)
    }
  }

  // If there's no input or it's a number, it's being called in the column declaration.
  if (!input || typeof input == "number") {
    return spacer
  }

  // Otherwise, it's being called in the column generator.
  else {
    input.addSpacer()
  }
}

// Change the current alignment to right.
function right(x) {
  currentAlignment = alignRight
}

// Change the current alignment to left.
function left(x) {
  currentAlignment = alignLeft
}

// Change the current alignment to center.
function center(x) {
  currentAlignment = alignCenter
}

/*
 * SETUP FUNCTIONS
 * These functions prepare data needed for items.
 * ==============================================
 */

// Set up the gradient for the widget background.
async function setupGradient() {
  // Requirements: sunrise
  if (!solarData) {
    await setupSolarData()
  }

  let gradient = {
    dawn: {
      color() {
        return [new Color("142C52"), new Color("1B416F"), new Color("62668B")]
      },
      position() {
        return [0, 0.5, 1]
      },
    },

    sunrise: {
      color() {
        return [new Color("274875"), new Color("766f8d"), new Color("f0b35e")]
      },
      position() {
        return [0, 0.8, 1.5]
      },
    },

    midday: {
      color() {
        return [new Color("3a8cc1"), new Color("90c0df")]
      },
      position() {
        return [0, 1]
      },
    },

    noon: {
      color() {
        return [new Color("b2d0e1"), new Color("80B5DB"), new Color("3a8cc1")]
      },
      position() {
        return [-0.2, 0.2, 1.5]
      },
    },

    sunset: {
      color() {
        return [new Color("32327A"), new Color("662E55"), new Color("7C2F43")]
      },
      position() {
        return [0.1, 0.9, 1.2]
      },
    },

    twilight: {
      color() {
        return [new Color("021033"), new Color("16296b"), new Color("414791")]
      },
      position() {
        return [0, 0.5, 1]
      },
    },

    night: {
      color() {
        return [new Color("16296b"), new Color("021033"), new Color("021033"), new Color("113245")]
      },
      position() {
        return [-0.5, 0.2, 0.5, 1]
      },
    },
  }

  const sunrise = solarData.sunrise
  const sunset = solarData.sunset

  // Use sunrise or sunset if we're within 15 minutes of it.
  if (closeTo(sunrise) <= 15) {
    return gradient.sunrise
  }
  if (closeTo(sunset) <= 15) {
    return gradient.sunset
  }

  // In the surrounding 45-minute window, use dawn/twilight.
  if (closeTo(sunrise) <= 45 && currentDate.getTime() < sunrise) {
    return gradient.dawn
  }
  if (closeTo(sunset) <= 45 && currentDate.getTime() > sunset) {
    return gradient.twilight
  }

  // Otherwise, if it's night, return night.
  if (isNight(currentDate)) {
    return gradient.night
  }

  // If it's around noon, the sun is high in the sky.
  if (currentDate.getHours() == 12) {
    return gradient.noon
  }

  // Otherwise, return the "typical" theme.
  return gradient.midday
}

// Set up the locationData object.
async function setupLocation() {
  locationData = {}
  const locationPath = files.joinPath(files.documentsDirectory(), "weather-cal-loc")

  // If our location is unlocked or cache doesn't exist, ask iOS for location.
  var readLocationFromFile = false
  if (!lockLocation || !files.fileExists(locationPath)) {
    try {
      const location = await Location.current()
      const geocode = await Location.reverseGeocode(location.latitude, location.longitude, locale)
      locationData.latitude = location.latitude
      locationData.longitude = location.longitude
      locationData.locality = geocode[0].locality
      files.writeString(
        locationPath,
        location.latitude + "|" + location.longitude + "|" + locationData.locality
      )
    } catch (e) {
      // If we fail in unlocked mode, read it from the cache.
      if (!lockLocation) {
        readLocationFromFile = true
      }

      // We can't recover if we fail on first run in locked mode.
      else {
        return
      }
    }
  }

  // If our location is locked or we need to read from file, do it.
  if (lockLocation || readLocationFromFile) {
    const locationStr = files.readString(locationPath).split("|")
    locationData.latitude = locationStr[0]
    locationData.longitude = locationStr[1]
    locationData.locality = locationStr[2]
  }
}

// Set up the solarData object.
async function setupSolarData() {
  // Requirements: weather
  if (!weatherData) {
    await setupWeather()
  }

  if (!weatherData.current || !weatherData.daily || weatherData.daily.length < 2) {
    throw t("errors.missingSolarData")
  }

  solarData = {
    sunrise: epochToDate(weatherData.current.sunrise).getTime(),
    sunset: epochToDate(weatherData.current.sunset).getTime(),
    tomorrow: epochToDate(weatherData.daily[1].sunrise).getTime(),
  }
}

function hasValidWeatherData(data) {
  data = normalizeWeatherData(data)

  return !!(
    data &&
    data.current &&
    Array.isArray(data.hourly) &&
    data.hourly.length > 0 &&
    Array.isArray(data.daily) &&
    data.daily.length > 1
  )
}

function normalizeWeatherData(data) {
  if (
    data &&
    typeof data === "object" &&
    !data.current &&
    data.payload &&
    typeof data.payload === "object"
  ) {
    return data.payload
  }

  return data 
}

function getWeatherDataError(data, requestError) {
  if (data && typeof data === "object" && data.message) {
    return t("errors.weatherApiError") + ": " + data.message
  }

  if (requestError && requestError.message) {
    return t("errors.weatherApiError") + ": " + requestError.message
  }

  return t("errors.invalidWeatherData")
}

function saveWeatherResponseSnapshot(data, source) {
  if (!saveWeatherApiResponse || !data) {
    return
  }

  const debugPath = files.joinPath(files.documentsDirectory(), "weather-cal-api-response.json")
  const snapshot = {
    savedAt: new Date().toISOString(),
    source,
    valid: hasValidWeatherData(data),
    payload: data,
  }

  try {
    files.writeString(debugPath, JSON.stringify(snapshot, null, 2))
  } catch (e) {
    console.log("Could not write weather debug file: " + e)
  }
}

// Set up the weatherData object.
async function setupWeather() {
  // Requirements: location
  if (!locationData) {
    await setupLocation()
  }

  // Set up the cache.
  const cachePath = files.joinPath(files.documentsDirectory(), "weather-cal-cache")
  const cacheExists = files.fileExists(cachePath)
  const cacheDate = cacheExists ? files.modificationDate(cachePath) : 0
  var weatherDataRaw
  let requestError = null

  // If cache exists and it's been less than 60 seconds since last request, use cached data.
  if (cacheExists && currentDate.getTime() - cacheDate.getTime() < 60000) {
    const cache = files.readString(cachePath)
    weatherDataRaw = normalizeWeatherData(JSON.parse(cache))
    saveWeatherResponseSnapshot(weatherDataRaw, "cache")

    // Otherwise, use the API to get new weather data.
  } else {
    try {
      let exclude = "minutely"
      if (!showAlerts) exclude = exclude + ",alerts"
      const weatherReq =
        "https://api.openweathermap.org/data/3.0/onecall?lat=" +
        locationData.latitude +
        "&lon=" +
        locationData.longitude +
        "&exclude=" +
        exclude +
        "&units=" +
        weatherSettings.units +
        "&lang=" +
        languageCode +
        "&appid=" +
        apiKey
      weatherDataRaw = normalizeWeatherData(await new Request(weatherReq).loadJSON())
      saveWeatherResponseSnapshot(weatherDataRaw, "api")
    } catch (e) {
      requestError = e
    }

    if (!hasValidWeatherData(weatherDataRaw)) {
      if (files.fileExists(cachePath)) {
        weatherDataRaw = normalizeWeatherData(JSON.parse(files.readString(cachePath)))
        saveWeatherResponseSnapshot(weatherDataRaw, "cache-fallback")
      }

      if (!hasValidWeatherData(weatherDataRaw)) {
        throw getWeatherDataError(weatherDataRaw, requestError)
      }
    }

    let updateddate = new Date()
    let hourupdate = updateddate.getHours()
    let minupdate = updateddate.getMinutes()
    if (hourupdate <= 9) hourupdate = "0" + hourupdate
    if (minupdate <= 9) minupdate = "0" + minupdate
    let updatedstring = hourupdate + ":" + minupdate
    weatherDataRaw.update = updatedstring
    files.writeString(cachePath, JSON.stringify(weatherDataRaw))
  }

  // Store the weather values.
  weatherData = weatherDataRaw
}

async function ensureLocationData() {
  if (!locationData) {
    await setupLocation()
  }
}

async function ensureWeatherData() {
  if (!weatherData) {
    await setupWeather()
  }
}

async function ensureSolarData() {
  if (!solarData) {
    await setupSolarData()
  }
}

async function ensureWeatherAndSolarData() {
  await ensureWeatherData()
  await ensureSolarData()
}

/*
 * WIDGET ITEMS
 * These functions display items on the widget.
 * ============================================
 */

function provideFunction(name) {
  const functions = {
    alerts() {
      return alerts
    },
    center() {
      return center
    },
    clouds() {
      return clouds
    },
    cloudstxt() {
      return cloudstxt
    },
    currentLoc() {
      return currentLoc
    },
    date() {
      return date
    },
    desconly() {
      return desconly
    },
    dewpoint() {
      return dewpoint
    },
    dewpointtxt() {
      return dewpointtxt
    },
    drawdiagram() {
      return drawdiagram
    },
    drawdiagramdaily() {
      return drawdiagramdaily
    },
    feelslike() {
      return feelslike
    },
    feelsliketxt() {
      return feelsliketxt
    },
    humidity() {
      return humidity
    },
    humiditytxt() {
      return humiditytxt
    },
    left() {
      return left
    },
    maxtemp() {
      return maxtemp
    },
    mintemp() {
      return mintemp
    },
    pressure() {
      return pressure
    },
    pressuretxt() {
      return pressuretxt
    },
    rain() {
      return rain
    },
    raintxt() {
      return raintxt
    },
    right() {
      return right
    },
    space() {
      return space
    },
    sunriseonly() {
      return sunriseonly
    },
    sunriseonlytxt() {
      return sunriseonlytxt
    },
    sunsetonly() {
      return sunsetonly
    },
    sunsetonlytxt() {
      return sunsetonlytxt
    },
    updatedtime() {
      return updatedtime
    },
    UVIndex() {
      return UVIndex
    },
    UVIndextxt() {
      return UVIndextxt
    },
    wind() {
      return wind
    },
    windtxt() {
      return windtxt
    },
  }

  return functions[name]
}

// Display the date on the widget.
async function date(column) {
  // Set up the date formatter and set its locale.
  let df = new DateFormatter()
  df.locale = locale

  if (dateSettings.staticDateSize == "small") {
    let dateStack = align(column)
    dateStack.setPadding(padding, padding, padding, padding)

    df.dateFormat = dateSettings.smallDateFormat
    let dateText = provideText(df.string(currentDate), dateStack, textFormat.smallDate)

    // Otherwise, show the large date.
  } else {
    let dateOneStack = align(column)
    df.dateFormat = dateSettings.largeDateLineOne
    let dateOne = provideText(df.string(currentDate), dateOneStack, textFormat.largeDate1)
    dateOneStack.setPadding(padding / 2, padding, 0, padding)

    let dateTwoStack = align(column)
    df.dateFormat = dateSettings.largeDateLineTwo
    let dateTwo = provideText(df.string(currentDate), dateTwoStack, textFormat.largeDate2)
    dateTwoStack.setPadding(0, padding, padding, padding)
  }
}

async function drawdiagram(column) {
  await ensureWeatherAndSolarData()
  const hourlyDiagram = buildHourlyDiagramModel()
  renderHourlyDiagram(column, hourlyDiagram)
}

async function drawdiagramdaily(column) {
  await ensureWeatherAndSolarData()
  const dailyDiagram = buildDailyDiagramModel()
  renderDailyDiagram(column, dailyDiagram)
}

// Current location name.
async function currentLoc(column) {
  return renderTextItem(column, {
    ensure: ensureLocationData,
    text: () => locationData.locality,
    format: textFormat.location,
    paddingValues: [0, 0, 0, 0],
    layoutHorizontally: true,
    applyWeatherUrl: true,
  })
}

// Current weather condition description (e.g. "Broken clouds").
async function desconly(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherAndSolarData,
    text: () => {
      const currentCondition = weatherData.current.weather[0]
      return getLocalizedConditionDescription(currentCondition.id, currentCondition.description)
    },
    format: textFormat.desconly,
    paddingValues: [0, 0, 0, 0],
    applyWeatherUrl: true,
  })
}

// Today's high temperature.
async function maxtemp(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => t("labels.max") + " " + Math.round(weatherData.daily[0].temp.max).toString() + "°",
    format: textFormat.HiLotemp,
    applyWeatherUrl: true,
  })
}

// Today's low temperature.
async function mintemp(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => t("labels.min") + " " + Math.round(weatherData.daily[0].temp.min).toString() + "°",
    format: textFormat.HiLotemp,
    applyWeatherUrl: true,
  })
}

// Time of today's sunset.
async function sunsetonly(column) {
  return renderTextItem(column, {
    ensure: ensureSolarData,
    text: () => formatWidgetTime(new Date(solarData.sunset)),
    format: textFormat.databtm,
    borderWidth: 0,
  })
}

// Time of today's sunrise.
async function sunriseonly(column) {
  return renderTextItem(column, {
    ensure: ensureSolarData,
    text: () => formatWidgetTime(new Date(solarData.sunrise)),
    format: textFormat.databtm,
  })
}

// "Feels like" apparent temperature.
async function feelslike(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => Math.round(weatherData.current.feels_like).toString() + "°",
    format: textFormat.databtm,
    borderWidth: 0,
    rightAlign: true,
  })
}

// Precipitation probability for the current hour (0–100 %).
async function rain(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => Math.round(100 * weatherData.hourly[0].pop).toString() + "%",
    format: textFormat.databtm,
    rightAlign: true,
  })
}

// Current dew point temperature.
async function dewpoint(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => Math.round(weatherData.current.dew_point).toString() + "°",
    format: textFormat.databtm,
    rightAlign: true,
  })
}

// Current relative humidity.
async function humidity(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => Math.round(weatherData.current.humidity).toString() + "%",
    format: textFormat.databtm,
    rightAlign: true,
  })
}

// Current atmospheric pressure (hPa or inHg depending on units setting).
async function pressure(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => formatPressureValue(),
    format: textFormat.databtm,
    rightAlign: true,
  })
}

// Current wind speed and compass direction.
async function wind(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => formatWindValue(),
    format: textFormat.databtm,
  })
}

// Current UV Index value.
async function UVIndex(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => weatherData.current.uvi.toString(),
    format: textFormat.databtm,
  })
}

// Current cloud coverage percentage.
async function clouds(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => Math.round(weatherData.current.clouds).toString() + "%",
    format: textFormat.databtm,
  })
}

// Timestamp of the last weather data refresh.
async function updatedtime(column) {
  return renderTextItem(column, {
    ensure: ensureWeatherData,
    text: () => t("labels.update") + weatherData.update,
    format: textFormat.updatetxt,
    paddingValues: [0, padding, 0, 0],
  })
}

async function alerts(column) {
  if (showAlerts) {
    await ensureWeatherData()

    const alertStack = align(column)
    alertStack.setPadding(0, 0, 0, padding)

    if (weatherData.alerts && weatherData.alerts.length > 0) {
      let alertText = "⚠️" + weatherData.alerts[0].event

      if (weatherData.alerts.length > 1) {
        const additionalAlertCount = weatherData.alerts.length - 1
        alertText =
          alertText +
          " & " +
          additionalAlertCount +
          " " +
          formatAdditionalAlertText(additionalAlertCount)
      }

      const alert = provideText(alertText, alertStack, textFormat.alertstxt)
    }
  }
}

// "Sunset" label.
async function sunsetonlytxt(column) {
  return renderInfoLabel(column, "labels.sunset", { borderWidth: 0 })
}

// "Sunrise" label.
async function sunriseonlytxt(column) {
  return renderInfoLabel(column, "labels.sunrise")
}

// "Feels like" label.
async function feelsliketxt(column) {
  return renderInfoLabel(column, "labels.feelsLike", { borderWidth: 0 })
}

// "Rain" label.
async function raintxt(column) {
  return renderInfoLabel(column, "labels.rain")
}

// "Dew point" label.
async function dewpointtxt(column) {
  return renderInfoLabel(column, "labels.dewPoint")
}

// "Humidity" label.
async function humiditytxt(column) {
  return renderInfoLabel(column, "labels.humidity")
}

// "Pressure" label.
async function pressuretxt(column) {
  return renderInfoLabel(column, "labels.pressure")
}

// "Wind" label.
async function windtxt(column) {
  return renderInfoLabel(column, "labels.wind")
}

// "UV Index" label.
async function UVIndextxt(column) {
  return renderInfoLabel(column, "labels.uvIndex")
}

// "Clouds" label.
async function cloudstxt(column) {
  return renderInfoLabel(column, "labels.clouds")
}

// Show the sunrise or sunset time.
async function sunrise(column) {
  // Requirements: sunrise
  await ensureSolarData()

  const sunrise = solarData.sunrise
  const sunset = solarData.sunset
  const tomorrow = solarData.tomorrow
  const current = currentDate.getTime()

  const showWithin = sunriseSettings.showWithin
  const closeToSunrise = closeTo(sunrise) <= showWithin
  const closeToSunset = closeTo(sunset) <= showWithin

  // If we only show sometimes and we're not close, return.
  if (showWithin > 0 && !closeToSunrise && !closeToSunset) {
    return
  }

  // Otherwise, determine which time to show.
  let timeToShow, symbolName
  const halfHour = 30 * 60 * 1000

  // If we're between sunrise and sunset, show the sunset.
  if (current > sunrise + halfHour && current < sunset + halfHour) {
    symbolName = "sunset.fill"
    timeToShow = sunset
  }

  // Otherwise, show a sunrise.
  else {
    symbolName = "sunrise.fill"
    timeToShow = current > sunset ? tomorrow : sunrise
  }

  // Set up the stack.
  const sunriseStack = align(column)
  sunriseStack.setPadding(padding / 2, padding, padding / 2, padding)
  sunriseStack.layoutHorizontally()
  sunriseStack.centerAlignContent()

  sunriseStack.addSpacer(padding * 0.3)

  // Add the correct symbol.
  const symbol = sunriseStack.addImage(SFSymbol.named(symbolName).image)
  symbol.imageSize = new Size(22, 22)
  tintIcon(symbol, textFormat.sunrise)

  sunriseStack.addSpacer(padding)

  // Add the time.
  const timeText = formatTime(new Date(timeToShow))
  const time = provideText(timeText, sunriseStack, textFormat.sunrise)
}

// Allow for either term to be used.
async function sunset(column) {
  return await sunrise(column)
}

async function offline(column) {
  let offline = false
  try {
    await new Request("https://openweathermap.org").load()
  } catch (e) {
    offline = true
  }

  let offlineStack = align(column)

  let offlineIndicator = provideText(offline ? "⚠️" : "", offlineStack, textFormat.warning)
  offlineIndicator.rightAlignText()
}

/*
 * HELPER FUNCTIONS
 * These functions perform duties for other functions.
 * ===================================================
 */

// Returns true when dateInput is before sunrise or after sunset.
// Also updates the global `night` flag used by symbolForCondition().
function isNight(dateInput) {
  const timeValue = dateInput.getTime()
  night = timeValue < solarData.sunrise || timeValue > solarData.sunset
  return night
}

// Returns the number of minutes between now and the provided date.
function closeTo(time) {
  return Math.abs(currentDate.getTime() - time) / 60000
}

function getWeatherPageUrl() {
  return (
    "https://weather.com/weather/today/l/" + locationData.latitude + "," + locationData.longitude
  )
}

function applyWeatherPageUrl(target) {
  target.url = getWeatherPageUrl()
}

function createItemStack(column, options = {}) {
  const stack = align(column)
  const paddingValues = options.paddingValues || [padding, 0, 0, 0]

  stack.setPadding(...paddingValues)

  if (options.layoutHorizontally) {
    stack.layoutHorizontally()
  }

  if (options.centerAlignContent) {
    stack.centerAlignContent()
  }

  if (options.applyWeatherUrl) {
    applyWeatherPageUrl(stack)
  }

  if (options.borderWidth != null) {
    stack.borderWidth = options.borderWidth
  }

  return stack
}

async function renderTextItem(column, options) {
  if (options.ensure) {
    await options.ensure()
  }

  const stack = createItemStack(column, options)
  const textValue = typeof options.text === "function" ? options.text() : options.text
  const textItem = provideText(textValue, stack, options.format)

  if (options.rightAlign || currentAlignment === alignRight) {
    textItem.rightAlignText()
  } else if (currentAlignment === alignCenter) {
    textItem.centerAlignText()
  }

  return textItem
}

async function renderInfoLabel(column, textKey, options = {}) {
  return renderTextItem(column, {
    text: () => t(textKey),
    format: textFormat.databtmtxt,
    ...options,
  })
}

function getLanguageCode(localeValue) {
  const normalizedLocale = (localeValue || "en").toLowerCase()

  if (normalizedLocale.startsWith("de")) {
    return "de"
  }

  return "en"
}

function getTranslationValue(dictionary, path) {
  return path.split(".").reduce((value, key) => (value ? value[key] : undefined), dictionary)
}

function t(path) {
  return getTranslationValue(strings, path) ?? getTranslationValue(i18n.en, path) ?? path
}

function getConditionDescriptionKey(condition) {
  if (condition === 800) return "clearSky"
  if (condition === 801) return "fewClouds"
  if (condition === 802) return "scatteredClouds"
  if (condition === 803) return "brokenClouds"
  if (condition === 804) return "overcastClouds"
  if (condition === 511) return "freezingRain"

  if ([611, 612, 613, 615, 616].includes(condition)) {
    return "sleet"
  }

  if (condition === 701) return "mist"
  if (condition === 711) return "smoke"
  if (condition === 721) return "haze"
  if (condition === 741) return "fog"
  if ([731, 751, 761].includes(condition)) return "dust"
  if (condition === 762) return "ash"
  if (condition === 771) return "squalls"
  if (condition === 781) return "tornado"

  switch (Math.floor(condition / 100)) {
    case 2:
      return "thunderstorm"
    case 3:
      return "drizzle"
    case 5:
      return "rain"
    case 6:
      return "snow"
    case 7:
      return "atmosphere"
    case 8:
      return "cloudy"
    default:
      return null
  }
}

function getLocalizedConditionDescription(condition, fallbackDescription = "") {
  const key = getConditionDescriptionKey(condition)

  if (!key) {
    return fallbackDescription
  }

  const translationPath = "conditions." + key
  const translation = t(translationPath)

  return translation === translationPath ? fallbackDescription : translation
}

function formatAdditionalAlertText(count) {
  return count === 1 ? t("alerts.additionalOne") : t("alerts.additionalMany")
}

// Format the time for a Date input.
function formatTime(date) {
  let df = new DateFormatter()
  df.locale = locale
  df.useNoDateStyle()
  df.useShortTimeStyle()
  return df.string(date)
}

function formatWidgetTime(date) {
  if (_12Hours) {
    let df = new DateFormatter()
    df.locale = "en"
    df.useNoDateStyle()
    df.useShortTimeStyle()
    return df.string(date)
  }

  // Zero-pad minutes so e.g. 9:05 is shown correctly instead of "9:5".
  const mm = String(date.getMinutes()).padStart(2, "0")
  return date.getHours() + ":" + mm
}

function formatPressureValue() {
  let unit = " hPa"
  let currentPressure = weatherData.current.pressure

  if (weatherSettings.units === "imperial") {
    currentPressure = (currentPressure / 33.8638).toFixed(2)
    unit = " inHg"
  } else {
    currentPressure = Math.round(currentPressure)
  }

  return currentPressure.toString() + unit
}

function formatWindValue() {
  const windDirection = getWindDirection(weatherData.current.wind_deg)
  const unit = weatherSettings.units === "imperial" ? " mph " : " m/s "
  return Math.round(weatherData.current.wind_speed).toString() + unit + windDirection
}

function getWindDirection(degrees) {
  const directions = strings.windDirections
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const directionIndex = Math.round(normalizedDegrees / 22.5) % directions.length
  return directions[directionIndex]
}

// Provide a font based on the input.
function provideFont(fontName, fontSize) {
  const fontGenerator = {
    ultralight: function () {
      return Font.ultraLightSystemFont(fontSize)
    },
    light: function () {
      return Font.lightSystemFont(fontSize)
    },
    regular: function () {
      return Font.regularSystemFont(fontSize)
    },
    medium: function () {
      return Font.mediumSystemFont(fontSize)
    },
    semibold: function () {
      return Font.semiboldSystemFont(fontSize)
    },
    bold: function () {
      return Font.boldSystemFont(fontSize)
    },
    heavy: function () {
      return Font.heavySystemFont(fontSize)
    },
    black: function () {
      return Font.blackSystemFont(fontSize)
    },
    italic: function () {
      return Font.italicSystemFont(fontSize)
    },
  }

  const systemFont = fontGenerator[fontName]
  if (systemFont) {
    return systemFont()
  }
  return new Font(fontName, fontSize)
}

// Add formatted text to a container.
function provideText(string, container, format) {
  const textItem = container.addText(string)
  const textFont = format.font || textFormat.defaultText.font
  const textSize = format.size || textFormat.defaultText.size
  const textColor = format.color || textFormat.defaultText.color

  textItem.font = provideFont(textFont, textSize)
  textItem.textColor = new Color(textColor, format.opacity ?? 1)
  return textItem
}

function tintIcon(icon, format) {
  const tintColor = format.color || textFormat.defaultText.color
  icon.tintColor = new Color(tintColor, format.opacity ?? 1)
}

function getDiagramStep(segmentCount) {
  if (segmentCount <= 0) {
    return 0
  }

  return (diagramSettings.canvas.width - diagramSettings.shared.fromLeft * 2) / segmentCount
}

function getAvailableSegmentCount(requestedSegments, dataPoints) {
  return Math.max(0, Math.min(requestedSegments, dataPoints - 2))
}

function buildHourlyDiagramModel() {
  const fromLeft = diagramSettings.shared.fromLeft
  const heightDiff = diagramSettings.shared.heightDiff
  const segmentCount = getAvailableSegmentCount(hoursToShow, weatherData.hourly.length)
  const spacing = getDiagramStep(segmentCount)
  let min, max
  for (let i = 0; i <= segmentCount; i++) {
    const temp = shouldRound(roundedGraph, weatherData.hourly[i].temp)
    min = temp < min || min == undefined ? temp : min
    max = temp > max || max == undefined ? temp : max
  }

  const diff = max - min

  const points = []
  for (let i = 0; i <= segmentCount; i++) {
    const hourData = weatherData.hourly[i]
    const nextHourTemp = shouldRound(roundedGraph, weatherData.hourly[i + 1].temp)
    const currentTemp = i == 0 ? weatherData.current.temp : hourData.temp
    const delta = diff > 0 ? (shouldRound(roundedGraph, currentTemp) - min) / diff : 0.5
    const nextDelta = diff > 0 ? (nextHourTemp - min) / diff : 0.5
    const dayData = findDailyDataForEpoch(hourData.dt)
    const isNightMode = hourData.dt > dayData.sunset || hourData.dt < dayData.sunrise
    const condition = i == 0 ? weatherData.current.weather[0].id : hourData.weather[0].id
    const graphBaseX = spacing * i + fromLeft
    const contentBaseX = graphBaseX - fromLeft
    const tempLayout =
      i == 0 ? diagramSettings.hourly.currentTemp : diagramSettings.hourly.forecastTemp

    points.push({
      condition,
      conditionDigit: Math.floor(condition / 100),
      contentBaseX,
      delta,
      graphBaseX,
      hourLabel: i == 0 ? t("diagram.now") : formatDiagramHour(hourData.dt),
      isNightMode,
      nextDelta: i < segmentCount ? nextDelta : null,
      tempFontSize: tempLayout.fontSize,
      tempHeight: tempLayout.height,
      tempLabel: shouldRound(roundedTemp, currentTemp) + "°",
      tempWidth: tempLayout.width,
      tempX: contentBaseX + tempLayout.xOffset,
      tempY: tempLayout.y - heightDiff * delta,
      verticalX: graphBaseX + diagramSettings.hourly.verticalXOffset,
    })
  }

  return { fromLeft, heightDiff, points, spacing }
}

function renderHourlyDiagram(column, model) {
  const diagramStack = createDiagramStack(column)

  drawLine(
    0,
    diagramSettings.shared.topRuleY,
    diagramSettings.canvas.width,
    diagramSettings.shared.topRuleY,
    1,
    linecolor
  )

  for (const point of model.points) {
    if (point.nextDelta != null) {
      drawTemperatureSegment(
        point.graphBaseX,
        point.graphBaseX + model.spacing,
        point.delta,
        point.nextDelta,
        model.heightDiff,
        point.isNightMode ? nightColor : accentColor
      )
    }

    drawLine(
      point.verticalX,
      diagramSettings.shared.verticalBottomY,
      point.verticalX,
      diagramSettings.shared.verticalBottomY -
        model.heightDiff * point.delta -
        diagramSettings.shared.verticalHeightOffset,
      2,
      linecolor
    )

    drawShadowedTextC(
      point.tempLabel,
      point.tempFontSize,
      point.tempX,
      point.tempY,
      point.tempWidth,
      point.tempHeight,
      getConditionColor(point.conditionDigit, point.isNightMode ? linecolor : accentColor)
    )

    drawConditionSymbol(
      point.condition,
      point.contentBaseX + diagramSettings.hourly.iconXOffset,
      diagramSettings.shared.iconY - model.heightDiff * point.delta,
      point.isNightMode
    )

    drawShadowedTextC(
      point.hourLabel,
      18,
      point.contentBaseX + diagramSettings.hourly.labelXOffset,
      diagramSettings.shared.labelY,
      diagramSettings.hourly.labelWidth,
      diagramSettings.hourly.labelHeight,
      point.isNightMode ? linecolor : accentColor
    )
  }

  drawLine(
    0,
    diagramSettings.shared.bottomRuleY,
    diagramSettings.canvas.width,
    diagramSettings.shared.bottomRuleY,
    1,
    linecolor
  )
  diagramStack.addImage(drawContext.getImage())
}

function buildDailyDiagramModel() {
  const fromLeft = diagramSettings.shared.fromLeft
  const heightDiff = diagramSettings.shared.heightDiff
  const segmentCount = getAvailableSegmentCount(daysToShow, weatherData.daily.length)
  const spacing = getDiagramStep(segmentCount)
  let min, max
  for (let i = 0; i <= segmentCount; i++) {
    const maxTemp = shouldRound(roundedGraph, weatherData.daily[i].temp.max)
    const minTemp = shouldRound(roundedGraph, weatherData.daily[i].temp.min)
    min = maxTemp < min || min == undefined ? maxTemp : min
    max = maxTemp > max || max == undefined ? maxTemp : max
    min = minTemp < min || min == undefined ? minTemp : min
    max = minTemp > max || max == undefined ? minTemp : max
  }

  const diff = max - min
  const weekday = strings.diagram.weekdays

  const maxPoints = []
  for (let i = 0; i <= segmentCount; i++) {
    const dayData = weatherData.daily[i]
    const temp = shouldRound(roundedGraph, dayData.temp.max)
    const nextTemp = shouldRound(roundedGraph, weatherData.daily[i + 1].temp.max)
    const delta = diff > 0 ? (temp - min) / diff : 0.5
    const nextDelta = diff > 0 ? (nextTemp - min) / diff : 0.5
    const condition = i == 0 ? weatherData.current.weather[0].id : dayData.weather[0].id
    const graphBaseX = spacing * i + fromLeft
    const contentBaseX = graphBaseX - fromLeft

    maxPoints.push({
      condition,
      conditionDigit: Math.floor(condition / 100),
      contentBaseX,
      dayLabel: i == 0 ? t("diagram.today") : weekday[epochToDate(dayData.dt).getDay()],
      delta,
      graphBaseX,
      nextDelta: i < segmentCount ? nextDelta : null,
      tempLabel: shouldRound(roundedTemp, dayData.temp.max) + "°",
    })
  }

  const minPoints = []
  for (let i = 0; i < segmentCount; i++) {
    const dayData = weatherData.daily[i]
    const temp = shouldRound(roundedGraph, dayData.temp.min)
    const nextTemp = shouldRound(roundedGraph, weatherData.daily[i + 1].temp.min)
    const delta = diff > 0 ? (temp - min) / diff : 0.5
    const nextDelta = diff > 0 ? (nextTemp - min) / diff : 0.5
    const condition = i == 0 ? weatherData.current.weather[0].id : dayData.weather[0].id
    const graphBaseX = spacing * i + fromLeft + spacing / 2
    const contentBaseX = graphBaseX - fromLeft

    minPoints.push({
      condition,
      conditionDigit: Math.floor(condition / 100),
      contentBaseX,
      delta,
      graphBaseX,
      nextDelta: i < segmentCount - 1 ? nextDelta : null,
      tempLabel: shouldRound(roundedTemp, dayData.temp.min) + "°",
    })
  }

  return { heightDiff, maxPoints, minPoints, spacing }
}

function renderDailyDiagram(column, model) {
  const diagramStack = createDiagramStack(column)

  for (const point of model.maxPoints) {
    if (point.nextDelta != null) {
      drawTemperatureSegment(
        point.graphBaseX,
        point.graphBaseX + model.spacing,
        point.delta,
        point.nextDelta,
        model.heightDiff,
        accentColor
      )
    }

    drawLine(
      point.graphBaseX + diagramSettings.daily.verticalXOffset,
      diagramSettings.shared.verticalBottomY,
      point.graphBaseX + diagramSettings.daily.verticalXOffset,
      diagramSettings.shared.verticalBottomY -
        model.heightDiff * point.delta -
        diagramSettings.shared.verticalHeightOffset,
      2,
      linecolor
    )

    drawShadowedTextC(
      point.tempLabel,
      diagramSettings.daily.tempFontSize,
      point.contentBaseX + diagramSettings.daily.textXOffset,
      diagramSettings.daily.maxTempY - model.heightDiff * point.delta,
      diagramSettings.daily.tempWidth,
      diagramSettings.daily.tempHeight,
      getConditionColor(point.conditionDigit, accentColor)
    )

    drawConditionSymbol(
      point.condition,
      point.contentBaseX + diagramSettings.daily.iconXOffset,
      diagramSettings.shared.iconY - model.heightDiff * point.delta,
      false
    )

    drawShadowedTextC(
      point.dayLabel,
      18,
      point.contentBaseX + diagramSettings.daily.labelXOffset,
      diagramSettings.shared.labelY,
      diagramSettings.daily.labelWidth,
      diagramSettings.daily.labelHeight,
      Color.white()
    )
  }

  for (const point of model.minPoints) {
    if (point.nextDelta != null) {
      drawTemperatureSegment(
        point.graphBaseX,
        point.graphBaseX + model.spacing,
        point.delta,
        point.nextDelta,
        model.heightDiff,
        nightColor
      )
    }

    drawShadowedTextC(
      point.tempLabel,
      diagramSettings.daily.tempFontSize,
      point.contentBaseX + diagramSettings.daily.textXOffset,
      diagramSettings.daily.minTempY - model.heightDiff * point.delta,
      diagramSettings.daily.tempWidth,
      diagramSettings.daily.tempHeight,
      getConditionColor(point.conditionDigit, linecolor)
    )

    drawConditionSymbol(
      point.condition,
      point.contentBaseX + diagramSettings.daily.iconXOffset,
      diagramSettings.shared.iconY - model.heightDiff * point.delta,
      true
    )
  }

  drawLine(
    0,
    diagramSettings.shared.bottomRuleY,
    diagramSettings.canvas.width,
    diagramSettings.shared.bottomRuleY,
    1,
    linecolor
  )
  diagramStack.addImage(drawContext.getImage())
}

/*
 * DRAWING FUNCTIONS
 * These functions draw onto a canvas.
 * ===================================
 */

function createDiagramContext() {
  let context = new DrawContext()
  context.size = new Size(diagramSettings.canvas.width, diagramSettings.canvas.height)
  context.opaque = false
  context.setTextAlignedCenter()
  return context
}

function createDiagramStack(column) {
  resetDiagramContext()

  let diagramStack = column.addStack()
  diagramStack.layoutHorizontally()
  diagramStack.setPadding(0, 0, 0, 0)
  diagramStack.borderWidth = 0

  return diagramStack
}

function resetDiagramContext() {
  drawContext = createDiagramContext()
}

function drawTemperatureSegment(x1, x2, delta1, delta2, heightDiff, color) {
  drawLine(
    x1,
    diagramSettings.shared.graphLineY - heightDiff * delta1,
    x2,
    diagramSettings.shared.graphLineY - heightDiff * delta2,
    4,
    shadow1
  )
  drawLine(
    x1,
    diagramSettings.shared.graphShadowLowY - heightDiff * delta1,
    x2,
    diagramSettings.shared.graphShadowLowY - heightDiff * delta2,
    4,
    shadow2
  )
  drawLine(
    x1,
    diagramSettings.shared.graphHighlightY - heightDiff * delta1,
    x2,
    diagramSettings.shared.graphHighlightY - heightDiff * delta2,
    4,
    color
  )
}

function drawShadowedTextC(text, fontSize, x, y, w, h, color) {
  drawTextC(text, fontSize, x + 1, y + 1, w, h, shadow1)
  drawTextC(text, fontSize, x + 2, y + 2, w, h, shadow2)
  drawTextC(text, fontSize, x + 3, y + 3, w, h, shadow3)
  drawTextC(text, fontSize, x, y, w, h, color)
}

function getConditionColor(conditionDigit, defaultColor) {
  if (conditionDigit === 2 || conditionDigit === 3 || conditionDigit === 5) {
    return rainColor
  }

  if (conditionDigit === 6) {
    return Color.white()
  }

  return defaultColor
}

function drawConditionSymbol(condition, x, y, isNightMode) {
  const previousNight = night
  night = isNightMode
  drawImage(symbolForCondition(condition), x, y)
  night = previousNight
}

function findDailyDataForEpoch(epoch) {
  for (const day of weatherData.daily) {
    if (isSameDay(epochToDate(day.dt), epochToDate(epoch))) {
      return day
    }
  }

  return weatherData.daily[0]
}

function formatDiagramHour(epoch) {
  let hour = epochToDate(epoch).getHours()

  if (diagram12Hours) {
    hour = hour > 12 ? hour - 12 : hour == 0 ? "12a" : hour == 12 ? "12p" : hour
  }

  if (typeof hour === "number" && hour <= 9) {
    return "0" + hour
  }

  return hour.toString()
}

function epochToDate(epoch) {
  return new Date(epoch * 1000)
}

function drawImage(image, x, y) {
  drawContext.drawImageAtPoint(image, new Point(x, y))
}

function drawTextC(text, fontSize, x, y, w, h, color = Color.black()) {
  drawContext.setFont(Font.boldSystemFont(fontSize))
  drawContext.setTextColor(color)
  drawContext.drawTextInRect(new String(text).toString(), new Rect(x, y, w, h))
}

function drawLine(x1, y1, x2, y2, width, color) {
  const path = new Path()
  path.move(new Point(x1, y1))
  path.addLine(new Point(x2, y2))
  drawContext.addPath(path)
  drawContext.setStrokeColor(color)
  drawContext.setLineWidth(width)
  drawContext.strokePath()
}

function shouldRound(should, value) {
  return should ? Math.round(value) : value
}

// This function returns an SFSymbol image for a weather condition.
function symbolForCondition(cond) {
  // Define our symbol equivalencies.
  let symbols = {
    // Thunderstorm
    2: function () {
      return "cloud.bolt.rain.fill"
    },

    // Drizzle
    3: function () {
      return "cloud.drizzle.fill"
    },

    // Rain
    5: function () {
      return cond == 511 ? "cloud.sleet.fill" : "cloud.rain.fill"
    },

    // Snow
    6: function () {
      return cond >= 611 && cond <= 613 ? "cloud.snow.fill" : "snow"
    },

    // Atmosphere
    7: function () {
      if (cond == 781) {
        return "tornado"
      }
      if (cond == 701 || cond == 741) {
        return "cloud.fog.fill"
      }
      return night ? "cloud.fog.fill" : "sun.haze.fill"
    },

    // Clear and clouds
    8: function () {
      if (cond == 800) {
        return night ? "moon.stars.fill" : "sun.max.fill"
      }
      if (cond == 802 || cond == 803) {
        return night ? "cloud.moon.fill" : "cloud.sun.fill"
      }
      return "cloud.fill"
    },
  }

  // Find out the first digit.
  let conditionDigit = Math.floor(cond / 100)

  // Get the symbol.
  let sfs = SFSymbol.named(symbols[conditionDigit]())
  sfs.applyFont(Font.systemFont(34))
  return sfs.image
}

// Returns true when both Date objects fall on the same calendar day.
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
