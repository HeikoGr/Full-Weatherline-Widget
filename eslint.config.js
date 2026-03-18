const js = require("@eslint/js")
const globals = require("globals")

const scriptableGlobals = {
  Alert: "readonly",
  Calendar: "readonly",
  CalendarEvent: "readonly",
  CallbackURL: "readonly",
  Color: "readonly",
  config: "readonly",
  Console: "readonly",
  DateFormatter: "readonly",
  Device: "readonly",
  DrawContext: "readonly",
  FileManager: "readonly",
  Font: "readonly",
  Image: "readonly",
  Keychain: "readonly",
  LinearGradient: "readonly",
  ListWidget: "readonly",
  Location: "readonly",
  Notification: "readonly",
  Path: "readonly",
  Photos: "readonly",
  Point: "readonly",
  QuickLook: "readonly",
  Rect: "readonly",
  Request: "readonly",
  Safari: "readonly",
  Script: "readonly",
  SFSymbol: "readonly",
  Size: "readonly",
  UITable: "readonly",
  UITableCell: "readonly",
  UITableRow: "readonly",
  URLScheme: "readonly",
  UUID: "readonly",
  WebView: "readonly",
}

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "emulator-output/**",
      ".scriptable-documents/**",
      "*.jpeg",
      "*.jpg",
      "*.png",
    ],
  },
  js.configs.recommended,
  {
    files: ["Full-Weatherline-Widget.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...scriptableGlobals,
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-unassigned-vars": "off",
      "no-useless-assignment": "off",
    },
  },
  {
    files: ["emulator/**/*.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "no-extra-semi": "error",
      "no-unreachable": "error",
    },
  },
]
