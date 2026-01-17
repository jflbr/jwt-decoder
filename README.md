# jwt-decoder

[![Install on VS Code](https://img.shields.io/badge/VS_Code-Install-blue?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=jflbr.jwt-decoder)
![Version](https://img.shields.io/vscode-marketplace/v/jflbr.jwt-decoder)
![Installs](https://img.shields.io/vscode-marketplace/i/jflbr.jwt-decoder)

A simple VS Code extension to decode your JSON Web Tokens (JWT)

## Command palette

The extension's name within the Command Palette is `JWT Decoder`.
 
## Features

The extension currently allows you to decode selected JWT strings in three differents ways:

### From Clipboard or Input Box (fallback)

From any document, fire the extension command without text selection. The extension will attempt to decode the clipboard value if it's a valid JWT. Otherwise, you'll be prompted to enter your JWT manually. The decoded token will appear in a message box at the right bottom corner. 

![](images/demo-from-input-box.gif)

### Hovering over the selected token

From any saved file, `select a JWT string`. Run the extension's command against it. Hover over the JWT string to get a Markdown-formatted of its decoded version.

![](images/demo-with-hover.gif)

### Selected JWT string within an VS Code untitled tab

If you call the extension cammand against a `selected JWT string` from an Untitled document, the decoded result will appear below the JWT.

![](images/demo-from-untitled-document.gif)
