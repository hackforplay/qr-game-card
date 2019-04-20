# QR ゲームカード

[English](https://github.com/hackforplay/qr-game-card/blob/master/README.md)

## 必要なもの

- [Sketch](https://www.sketch.com/) (macOS のみ)
- Node.js バージョン 10 以上

## 使い方

インストール＆実行

- `npx @hackforplay/qr-game-card <url ...>`
- 例: `npx @hackforplay/qr-game-card https://www.hackforplay.xyz/works/ncWg2cgh4LOQpuAyfrUN`

もしくは、ローカルマシンにインストールして実行

- `npm install -g @hackforplay/qr-game-card`
- `qrgc <url ...>`

> npm でグローバルインストールするには、おそらく `sudo` が必要です

## オプション

```
Usage: qrgc [options] <url ...>

Options:
  -v, --version         output the version number
  -o, --output [value]  Where to output the generated files - defaults to the current working directory (optional).
  -h, --help            output usage information
```

例: `qrgc -o path/to/destination https://www.hackforplay.xyz/works/ncWg2cgh4LOQpuAyfrUN`

## API

- ありません
