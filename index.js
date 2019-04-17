const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");

const zip = new JSZip();

addRecursive("./template");

zip
  .generateNodeStream({ type: "nodebuffer", streamFiles: true })
  .pipe(fs.createWriteStream("out.sketch"))
  .on("finish", function() {
    console.log("out.sketch written.");
  });

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
    const buffer = fs.readFileSync(absolutePath);
    zip.file(relativePath, buffer);
  }
}
