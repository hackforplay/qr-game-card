const JSZip = require("jszip");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

const cwd = process.cwd();

const addRecursive = (zip, data, template, relativePath = "") => {
  const absolutePath = path.resolve(template, relativePath);
  const stat = fs.statSync(absolutePath);
  if (
    stat.isDirectory() &&
    relativePath !== "previews" &&
    relativePath !== "text-previews"
  ) {
    for (const basePath of fs.readdirSync(absolutePath)) {
      addRecursive(zip, data, template, path.join(relativePath, basePath));
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
};

module.exports = (workId, template = __dirname + "/template") =>
  new Promise(async (resolve, reject) => {
    const zip = new JSZip();

    const loadData = require("./loadData");
    const data = await loadData(workId, zip);

    addRecursive(zip, data, template);

    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream("out.sketch"))
      .on("finish", function() {
        console.log("out.sketch written.");
        const cmd = `eval "$(mdfind kMDItemCFBundleIdentifier == 'com.bohemiancoding.sketch3' | head -n 1)/Contents/Resources/sketchtool/bin/sketchtool export pages out.sketch --formats=pdf"`;
        console.log(cmd);
        child_process.execSync(cmd);
        console.log("pdf generated!");
        resolve();
      });
  });
