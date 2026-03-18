# Emulator API Status

Technical implementation status of the local Scriptable emulator in this repository.

## Legend

| Symbol | Meaning |
| --- | --- |
| ✓ | Yes: the API surface exists in the emulator and is implemented for the current use case |
| ○ | Partial: the API exists, but only as a reduced implementation, approximation, or stub |
| ✗ | No: the API is not available in the emulator |

## Evaluation Basis

| Source | Purpose |
| --- | --- |
| `node_modules/@types/scriptable-ios/index.d.ts` | Reference for the Scriptable top-level API |
| `emulator/runtime.js` | Actual emulator sandbox implementation |
| `emulator/render.js`, `emulator/watch.js`, `emulator/serve.js` | Emulator-specific runtime and preview flow |

## Scope

This file evaluates the top-level APIs from the local Scriptable type definitions.

Not listed as separate rows:

- namespace-only interfaces without a direct global API surface
- full method signatures for every non-relevant class
- iOS runtime details described by the types but intentionally not reproduced by the emulator

## Top-Level API Matrix

### UI, Widget, and Layout

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| Alert | Class | Modal dialog with actions | ✗ | Not present in the sandbox |
| ListWidget | Class | Root widget container | ○ | Core layout exists, presentation methods are no-op |
| WidgetStack | Class | Horizontal or vertical layout container | ○ | Base layout exists, not complete |
| WidgetText | Class | Text node inside a widget | ○ | Basic attributes are present |
| WidgetImage | Class | Image node inside a widget | ○ | Basic attributes are present |
| WidgetDate | Class | Date and time node for widgets | ✗ | Not implemented |
| WidgetSpacer | Class | Flexible or fixed spacing node | ○ | Base node exists |
| UITable | Class | Table UI | ✗ | Not implemented |
| UITableCell | Class | Table cell | ✗ | Not implemented |
| UITableRow | Class | Table row | ✗ | Not implemented |

### Drawing, Graphics, and Geometry

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| DrawContext | Class | Canvas for text, lines, and images | ○ | Only required drawing operations are implemented |
| Color | Class | Color with alpha support | ○ | Constructor and a few static helpers exist |
| Font | Class | Font definitions | ○ | System font mapping and CSS output exist |
| Image | Class | General image API | ✗ | No full Scriptable image model |
| LinearGradient | Class | Linear color gradient | ○ | Only colors and locations are used |
| Path | Class | Path definition for drawing | ○ | Only required primitives are implemented |
| Point | Class | 2D point | ✓ | Simple data class |
| Rect | Class | Rectangle | ✓ | Simple data class |
| Size | Class | Size object | ✓ | Simple data class |
| SFSymbol | Class | SF Symbol access | ○ | Lucide or emoji approximation instead of native symbols |

### Data, Formatting, and Networking

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| Data | Class | Byte and string data container | ✗ | Not implemented |
| DateFormatter | Class | Date and time formatting | ○ | Only required patterns and styles are implemented |
| RelativeDateTimeFormatter | Class | Relative time strings | ✗ | Not implemented |
| Request | Class | HTTP requests | ○ | Only widget-specific flows are modeled |
| XMLParser | Class | Event-driven XML parser | ✗ | Not implemented |

### Files, Photos, and Location

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| FileManager | Class | File and cache access | ○ | Local file flow for this repository |
| Photos | Global Object | Photo selection | ○ | Returns only a placeholder image |
| Location | Global Object | Location and reverse geocoding | ○ | Only config-based mock location support |

### System, Script, and Global Runtime

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| Script | Global Object | Widget registration and script lifecycle | ○ | Only `setWidget` and `complete` |
| Device | Global Object | Device information | ○ | Only `locale()` is implemented |
| config | Global Object | Execution context | ○ | Only `widgetFamily` is implemented |
| args | Global Object | Widget, share sheet, or URL arguments | ✗ | Not implemented |
| console | Global Object | Logging | ✓ | Node console is passed through |
| importModule | Function | Module import relative to the script | ✓ | Local resolver exists |
| log | Function | Scriptable logging helper | ✗ | Not implemented as a Scriptable helper |
| logWarning | Function | Scriptable warning logging helper | ✗ | Not implemented |
| logError | Function | Scriptable error logging helper | ✗ | Not implemented |
| atob | Function | Base64 to ASCII conversion | ✗ | Not implemented |
| btoa | Function | ASCII to Base64 conversion | ✗ | Not implemented |

### Calendar, Reminders, and Contacts

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| Calendar | Class | Calendar access | ✗ | Not implemented |
| CalendarEvent | Class | Calendar event | ✗ | Not implemented |
| Reminder | Class | Reminder item | ✗ | Not implemented |
| RecurrenceRule | Class | Recurrence rule definition | ✗ | Not implemented |
| Contact | Class | Contact object | ✗ | Not implemented |
| ContactsContainer | Class | Contact container | ✗ | Not implemented |
| ContactsGroup | Class | Contact group | ✗ | Not implemented |

### Communication and Integrations

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| CallbackURL | Class | x-callback-url requests | ✗ | Not implemented |
| Mail | Class | Email composition | ✗ | Not implemented |
| Message | Class | Message composition | ✗ | Not implemented |
| Notification | Class | Local notifications | ✗ | Not implemented |
| Safari | Global Object | Open URLs externally or in-app | ✗ | Not implemented |
| ShareSheet | Global Object or Namespace | Share dialog | ✗ | Not implemented |
| WebView | Class | In-app web view | ✗ | Not implemented |
| QuickLook | Global Object | File preview | ✗ | Not implemented |
| URLScheme | Global Object | URL scheme interaction | ✗ | Not implemented |

### Input, Pickers, and Other System APIs

| API | Type | Short Description | Status | Note |
| --- | --- | --- | --- | --- |
| DatePicker | Class | Date and time picker | ✗ | Not implemented |
| TextField | Class | Input field | ✗ | Not implemented |
| Timer | Class | Timed execution | ✗ | Not implemented |
| DocumentPicker | Global Object | File picker from Files app | ✗ | Not implemented |
| Pasteboard | Global Object | Clipboard access | ✗ | Not implemented |
| Keychain | Global Object | Secure key storage | ✗ | Not implemented |
| Speech | Global Object | Text-to-speech | ✗ | Not implemented |
| UUID | Global Object | UUID generation | ✗ | Not implemented |

## Detailed Coverage of APIs Relevant to This Repository

### Widget and Layout Core

| API | Relevant Members | Status | Short Note |
| --- | --- | --- | --- |
| ListWidget | `backgroundColor`, `backgroundGradient`, `backgroundImage`, `presentLarge`, `presentMedium`, `presentSmall` | ○ | Layout and serialization exist, presentation is no-op |
| WidgetStack | `addStack`, `addText`, `addImage`, `addSpacer`, `layoutHorizontally`, `layoutVertically`, `setPadding`, `centerAlignContent`, `spacing`, `size`, `url`, `borderWidth` | ○ | Tailored to this widget layout model |
| WidgetText | `font`, `textColor`, `rightAlignText`, `centerAlignText`, `leftAlignText` | ○ | Basic text formatting exists |
| WidgetImage | `imageSize`, `tintColor` | ○ | Enough for symbols and chart images |
| WidgetSpacer | flexible and fixed spacers | ○ | Base model only |

### Drawing and Symbols

| API | Relevant Members | Status | Short Note |
| --- | --- | --- | --- |
| DrawContext | `size`, `opaque`, `respectScreenScale`, `setTextAlignedCenter`, `setFont`, `setTextColor`, `setFillColor`, `setStrokeColor`, `setLineWidth`, `addPath`, `fillPath`, `strokePath`, `drawText`, `drawTextInRect`, `drawImageAtPoint`, `getImage` | ○ | Enough for charts, not a full Scriptable drawing pipeline |
| Path | `move`, `addLine`, `addRoundedRect`, `addEllipse` | ○ | Only required primitives |
| SFSymbol | `named`, `applyFont`, `image` | ○ | Visual output is approximated, not native |
| Color | constructor, `gray`, `black`, `white` | ○ | Many Scriptable color helpers are missing |
| Font | system font family and weights | ○ | Good approximation, but no iOS font metric parity |

### Data, Cache, and Environment

| API | Relevant Members | Status | Short Note |
| --- | --- | --- | --- |
| Request | `loadJSON`, `load` | ○ | Mock weather and simple live requests |
| FileManager | `local`, `documentsDirectory`, `joinPath`, `fileExists`, `readString`, `writeString`, `readImage`, `writeImage`, `modificationDate` | ○ | Cache and image flow for this repository |
| DateFormatter | `dateFormat`, `locale`, `useNoDateStyle`, `useShortTimeStyle`, `string` | ○ | Only required format patterns |
| Device | `locale` | ○ | Only this property is passed through |
| Location | `current`, `reverseGeocode` | ○ | Config-driven location support |
| Photos | `fromLibrary` | ○ | Placeholder instead of a real picker |
| Script | `setWidget`, `complete` | ○ | Enough for the render pipeline |
| config | `widgetFamily` | ○ | Additional Scriptable execution flags are missing |
| importModule | relative import | ✓ | Functional for local modules |

## Known Technical Deviations

| Area | Deviation |
| --- | --- |
| Rendering | HTML and CSS preview instead of the real iOS widget engine |
| Typography | No true iOS font metrics and no native text layout stack |
| Symbols | SF Symbols are approximated |
| DrawContext | No full Scriptable compositing or image-processing support |
| Location and Photos | Config-based or placeholder behavior instead of native OS dialogs |
| config | Only a very small subset of the real script context |
| Presentation | `presentLarge`, `presentMedium`, and `presentSmall` are no-op |

## Emulator-Specific Extra Features

These are not part of the Scriptable API, but they are part of the local development tool:

| Feature | Description |
| --- | --- |
| HTML preview | Renders the widget as a browser preview |
| Preview server | Local HTTP server for preview output |
| Watch mode | Automatically rebuilds on file changes |
| Widget tree JSON | Serialized UI structure for debugging |
| Configurable location | Location comes from `emulator.config.json` |
| Mock or live weather | Toggleable for local development |

## Useful Additions for This File

If this file should move even further toward a technical reference, these additions would fit well:

| Idea | Benefit |
| --- | --- |
| Method matrix per relevant API | Exact comparison between type definitions and emulator behavior |
| "Used by this widget" column | Separates missing APIs from real gaps |
| "Source" column | Links each row back to `runtime.js` or the type definitions |
| Priority matrix | Shows which missing APIs matter most for future widgets |
| Deviation log | Documents intentional emulator simplifications |
| Test status | Distinguishes exposed APIs from APIs actually exercised in the render path |

## Recommended Next Expansion Priorities

From the perspective of this repository, these emulator improvements would be the most useful:

| Priority | Topic | Why |
| --- | --- | --- |
| 1 | Expand `config` | Many widgets branch on `runsInWidget`, `runsInApp`, or `widgetParameter` |
| 2 | Add `WidgetDate` | Common widget API, currently completely missing |
| 3 | Add `Image` and image helpers | Improves realism for backgrounds and symbol handling |
| 4 | Add `Data` | Makes file, request, and conversion behavior more compatible |
| 5 | Expand `Device` | Often needed for dynamic widget behavior |
| 6 | Add `args` | Relevant for widget parameters and deep-link flows |

## Summary

The emulator broadly covers the widget, drawing, cache, and request surface needed by Full-Weatherline-Widget.

As a general Scriptable emulator, coverage is still clearly selective:

- strong on core widget layout
- adequate for DrawContext-based charts
- reduced in file, symbol, and formatter details
- largely empty for integrations, tables, contacts, calendars, and system dialogs