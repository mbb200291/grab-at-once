# Grab at Once!

Grab at Once! is a Chrome extension for downloading multiple linked files by drawing a selection box over a webpage.

## Features

- Toggle drag selection from the extension icon.
- Download multiple file links in one selection.
- Highlight selected links before downloading.
- Keep the enabled state between browser sessions.
- Recognize file URLs even when they contain query parameters.

## Installation

Grab at Once! is currently installed as an unpacked Chrome extension:

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose this project directory.

## Usage

1. Click the Grab at Once! extension icon. The **ON** badge indicates that drag selection is enabled.
2. Drag a box around the file links you want to download.
3. Release the mouse button to download the selected files.
4. Click the extension icon again to disable drag selection.

For uninterrupted batch downloads, open `chrome://settings/downloads` and turn off **Ask where to save each file before downloading**.

![Chrome download setting](chrome-setting-download.png)

## Supported file types

The current version recognizes these filename extensions:

`.gif`, `.pdf`, `.ppt`, `.pptx`, `.jpg`, `.jpeg`, `.png`, `.zip`, `.mp4`, `.mp3`, `.svg`, and `.webp`.

## Limitations

- Only direct links whose URL path ends with a supported filename extension are detected.
- Chrome may block automatic downloads or ask for permission when a site starts multiple downloads.
- Chrome internal pages, the Chrome Web Store, and other protected pages do not allow extension scripts to run.

## Development

This project uses Chrome Extension Manifest V3 and does not require a build step. After changing the source files, reload the extension from `chrome://extensions` and refresh the page used for testing.

Key files:

- `manifest.json` — extension metadata and permissions
- `background.js` — extension state and toolbar action
- `dragbox.js` — selection, link detection, highlighting, and downloads
- `privacy.html` — privacy policy

See the [development plan](docs/plan.md) for completed work and upcoming improvements.

## Privacy

Grab at Once! does not collect, transmit, or sell personal data. The enabled state is stored locally in Chrome. See the [privacy policy](privacy.html) for details.

## Attribution

The extension icon was designed by [Pixel perfect](https://www.flaticon.com/free-icon/grab_1196462) and published on [Flaticon](https://www.flaticon.com/).
