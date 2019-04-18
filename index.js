const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const urlRegexp = /^https?\:\/\/(www\.)?hackforplay\.xyz\/works\/(\w+)/;
const url = "https://www.hackforplay.xyz/works/DiO7qmB9Oql8yzv8A087";

const zip = new JSZip();

(async () => {
  urlRegexp.lastIndex = 0;
  const result = urlRegexp.exec(url);
  const workId = result && result[2];
  if (!result || typeof workId !== "string") {
    throw new Error("Invalid URL");
  }

  const loadData = require("./loadData");
  const data = await loadData(workId, zip);

  addRecursive(data, "./template");

  zip
    .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    .pipe(fs.createWriteStream("out.sketch"))
    .on("finish", function() {
      console.log("out.sketch written.");
      const cmd = `eval "$(mdfind kMDItemCFBundleIdentifier == 'com.bohemiancoding.sketch3' | head -n 1)/Contents/Resources/sketchtool/bin/sketchtool export pages out.sketch --formats=pdf"`;
      console.log(cmd);
      child_process.execSync(cmd);
      console.log("pdf generated!");
    });
})();

function processPage(data, json) {
  const page = JSON.parse(json);
  const title = findObject(page, "text", "title");
  if (title) {
    title.attributedString.string = data.title + "　"; // 英語だとフォントが変わる？ので、全角スペースを入れる
  }
  const author = findObject(page, "text", "author");
  if (author) {
    author.attributedString.string = data.author + "　"; // 英語だとフォントが変わる？ので、全角スペースを入れる
  }
  const thumbnail = findObject(page, "bitmap", "gameThum");
  if (thumbnail) {
    thumbnail.image._ref = data.thumbnail;
  }
  const qr = findObject(page, "bitmap", "qr");
  if (qr) {
    qr.image._ref = data.qr;
  }
  return JSON.stringify(page);
}

function findObject(object, _class, name) {
  if (object._class === _class && object.name === name) return object;
  if (Array.isArray(object.layers)) {
    for (const child of object.layers) {
      const result = findObject(child, _class, name);
      if (result !== null) return result;
    }
  }
  return null;
}

function addRecursive(data, rootPath, relativePath = "") {
  const absolutePath = path.join(rootPath, relativePath);
  const stat = fs.statSync(absolutePath);
  if (
    stat.isDirectory() &&
    relativePath !== "previews" &&
    relativePath !== "text-previews"
  ) {
    for (const basePath of fs.readdirSync(absolutePath)) {
      addRecursive(data, rootPath, path.join(relativePath, basePath));
    }
  } else if (stat.isFile()) {
    if (/pages\/.+\.json$/i.test(absolutePath)) {
      const text = fs.readFileSync(absolutePath, "utf8");
      zip.file(relativePath, processPage(data, text));
    } else {
      const buffer = fs.readFileSync(absolutePath);
      zip.file(relativePath, buffer);
    }
  }
}
