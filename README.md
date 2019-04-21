# qr-game-card

[日本語](https://github.com/hackforplay/qr-game-card/blob/master/README_ja.md)

## Requirements

- [Sketch](https://www.sketch.com/) (macOS only)
- Node.js ^10.0

## Getting Started

Install then execute

- `npx @hackforplay/qr-game-card <url ...>`
- For example: `npx @hackforplay/qr-game-card https://www.hackforplay.xyz/works/ncWg2cgh4LOQpuAyfrUN`

or, you can install globally to

- `npm install -g @hackforplay/qr-game-card`
- `qrgc <url ...>`

> You may need to `sudo` to install globally

## CLI

```
Usage: qrgc [options] <url ...>

Options:
  -v, --version           output the version number
  -o, --output [value]    Where to output the generated files - defaults to the current working directory (optional).
  -t, --template [value]  Where is sketch file which is used as template. It allows relative path from current working directory or default template (yellow). (default: "yellow")
  -h, --help              output usage information
```

For example: `qrgc -o path/to/destination -t yellow https://www.hackforplay.xyz/works/ncWg2cgh4LOQpuAyfrUN`

## API

- Not provided
