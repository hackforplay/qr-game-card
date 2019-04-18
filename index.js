const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const data = {
  title: "タイトルを入れる",
  author: "作者名を入れる",
  thumbnail: "images/878bdf66b1d604785d1ec03d816336460f25b5d1.png"
};

const zip = new JSZip();

addRecursive("./template");

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

function processPage(json) {
  const page = JSON.parse(json);
  const title = findObject(page, "text", "title");
  if (title) {
    title.attributedString.string = data.title;
  }
  const author = findObject(page, "text", "author");
  if (author) {
    author.attributedString.string = data.author;
  }
  const thumbnail = findObject(page, "bitmap", "gameThum");
  if (thumbnail) {
    thumbnail.image._ref = data.thumbnail;
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

function addRecursive(rootPath, relativePath = "") {
  const absolutePath = path.join(rootPath, relativePath);
  const stat = fs.statSync(absolutePath);
  if (
    stat.isDirectory() &&
    relativePath !== "previews" &&
    relativePath !== "text-previews"
  ) {
    for (const basePath of fs.readdirSync(absolutePath)) {
      addRecursive(rootPath, path.join(relativePath, basePath));
    }
  } else if (stat.isFile()) {
    if (/pages\/.+\.json$/i.test(absolutePath)) {
      const text = fs.readFileSync(absolutePath, "utf8");
      zip.file(relativePath, processPage(text));
    } else {
      const buffer = fs.readFileSync(absolutePath);
      zip.file(relativePath, buffer);
    }
  }
}
