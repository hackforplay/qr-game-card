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
      const convert = require("./convert");
      zip.file(relativePath, convert(data, text));
    } else {
      const buffer = fs.readFileSync(absolutePath);
      zip.file(relativePath, buffer);
    }
  }
}
