# Full-Weatherline-Widget

<p align="center">
  <img width="500" alt="Full Weatherline Widget" src="./5964BDCB-2029-4FA1-AE2B-A0CE429662A5.jpeg">
</p>

Full-Weatherline-Widget is a Scriptable weather widget for iPhone with large and medium layouts. It combines Weatherline-style forecast charts with a dense, readable information panel for current conditions and key daily metrics.

<p align="center">
  <img width="500" alt="Full Weatherline Widget alternate preview" src="./F0D4D313-0456-422F-8D48-D11E46687AB1.png">
</p>

## Highlights

- Large and medium widget support
- Hourly temperature trend chart
- Daily high and low trend chart
- Current conditions with localized weather text
- Sunrise and sunset times
- Rain probability, dew point, humidity, wind, UV index, pressure, and cloud coverage
- Dynamic time-of-day gradient background
- Optional photo background
- Offline fallback using cached weather data
- Optional weather alerts
- Configurable 12-hour or 24-hour time format
- Configurable colors and text styles
- Optional custom tap URL
- Local desktop emulator for previewing changes

## Requirements

- Scriptable for iOS
- An OpenWeather API key

Get a key here:

- https://openweathermap.org/appid

## Scriptable Setup

1. Add Full-Weatherline-Widget.js to Scriptable.
2. Open the script and edit the setup section near the top.
3. Paste in your OpenWeather API key.
4. Adjust the options you want.
5. Run the script once inside Scriptable.
6. If photo background mode is enabled, choose an image when prompted.
7. Add the script to a large or medium home screen widget.

Small widgets are not supported.

## Configuration

All configuration lives directly inside Full-Weatherline-Widget.js.

### API And Locale

```javascript
const apiKey = "YOUR_API_KEY_HERE"
let locale = ""
```

- Use an empty locale string to follow the device language.
- Set locale to values like "en" or "de" to force a language.

Example:

```javascript
let locale = "de"
```

### Tap Action And Location Behavior

```javascript
const externalLink = ""
const lockLocation = true
```

- externalLink opens a custom URL when the widget is tapped.
- lockLocation keeps the first successful GPS result and reuses it later.

Example:

```javascript
const externalLink = "https://weather.com/"
const lockLocation = false
```

### Widget Preview Size

This only affects the preview shown when running the script inside Scriptable.

```javascript
const widgetPreview = "large"
```

Supported values:

- large
- medium

### Background Mode

Use the built-in gradient:

```javascript
const imageBackground = false
const forceImageUpdate = false
```

Use a photo background:

```javascript
const imageBackground = true
const forceImageUpdate = true
```

After selecting a new image once, set it back to:

```javascript
const forceImageUpdate = false
```

### Spacing

```javascript
const padding = 0
```

Higher values create more breathing room between elements.

### Forecast Density

```javascript
const hoursToShow = 12
const daysToShow = 4
const roundedGraph = true
const roundedTemp = true
```

Example:

```javascript
const hoursToShow = 8
const daysToShow = 5
```

### Time Format

```javascript
const _12Hours = false
const diagram12Hours = false
```

- _12Hours controls sunrise, sunset, and metric row times.
- diagram12Hours controls the hourly chart labels.

Example:

```javascript
const _12Hours = true
const diagram12Hours = true
```

### Alerts And Shadows

```javascript
const showAlerts = false
const showShadows = false
```

Example:

```javascript
const showAlerts = true
const showShadows = true
```

### Units And Sunrise Window

```javascript
const sunriseSettings = {
  showWithin: 0,
}

const weatherSettings = {
  units: "metric",
}
```

Unit options:

- metric for °C, m/s, hPa
- imperial for °F, mph, inHg

Example:

```javascript
const sunriseSettings = {
  showWithin: 45,
}

const weatherSettings = {
  units: "imperial",
}
```

### Palette

```javascript
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
```

This palette drives most colors across the widget.

### Text Styling

```javascript
const textFormat = {
  defaultText: { size: 14, color: palette.textPrimary.slice(1), font: "regular" },
  location: { size: 14, color: "", font: "semibold", opacity: 1 },
  desconly: { size: 12, color: "", font: "regular", opacity: 1 },
  databtm: { size: 10, color: palette.textPrimary.slice(1), font: "bold", opacity: 1 },
  databtmtxt: { size: 10, color: palette.textSecondary.slice(1), font: "regular", opacity: 1 },
}
```

System font values include:

- ultralight
- light
- regular
- medium
- semibold
- bold
- heavy
- black
- italic

## Example Setups

### Default Metric Setup

```javascript
const apiKey = "YOUR_API_KEY_HERE"
let locale = ""
const lockLocation = true
const widgetPreview = "large"
const imageBackground = false
const hoursToShow = 12
const daysToShow = 4

const weatherSettings = {
  units: "metric",
}
```

### Travel Setup

```javascript
let locale = "en"
const externalLink = "https://weather.com/"
const lockLocation = false
const widgetPreview = "medium"

const weatherSettings = {
  units: "imperial",
}
```

### Photo Background Setup

```javascript
const imageBackground = true
const forceImageUpdate = true
const showShadows = true
```

Then switch back to:

```javascript
const forceImageUpdate = false
```

## Behavior Notes

- Weather data is cached briefly to avoid unnecessary requests.
- If a live request fails, the widget falls back to the last cached response.
- If no cache exists and the device is offline, the widget shows an offline error.
- With lockLocation enabled, the first successful location is stored and reused.

## Local Emulator

The repository includes a lightweight desktop emulator for previewing the widget while you edit it.

### Standard Workflow

Start the emulator with:

```bash
npm run preview
```

This command now does the full development loop by default:

- renders the widget once
- starts a local preview server
- opens the preview in your browser
- watches widget and emulator files for changes
- rebuilds automatically after edits

The default preview URL is:

```text
http://localhost:4173/
```

### Install Dependencies

```bash
npm install
```

### Output Files

Each rebuild writes:

- emulator-output/widget-preview.html
- emulator-output/widget-tree.json

The PNG screenshot output was removed to keep the emulator setup simpler and more predictable.

### Configuration

Desktop preview behavior is controlled through emulator.config.json.

Useful options include:

- widgetFamily
- location.latitude
- location.longitude
- location.locality
- widgetSizes.large
- widgetSizes.medium
- widgetSizes.small
- useMockWeather

### How Watching Works

The watch mode rebuilds when these files change:

- Full-Weatherline-Widget.js
- emulator.config.json
- JavaScript files inside emulator/

### Limitations

- The emulator is intentionally partial.
- It implements only the Scriptable APIs this widget currently needs.
- It is a preview tool, not a full Scriptable replacement.

For a precise API coverage list, see:

- EMULATOR_API_STATUS.md

### One-Off Render

The internal build script is still:

```bash
node emulator/render.js
```

## Development

```bash
npm run lint
npm run lint:fix
npm run format:check
npm run format
```

## Credits

- Original base inspiration from Max Zeryck’s weather widget work
- Additional ideas and contributions by thewaytozion, P Jai Rjlin, and webOSpinn