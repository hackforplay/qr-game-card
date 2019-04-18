const JSZip = require("jszip");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const mkdirp = require("mkdirp");

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

module.exports = (workId, { output = "./" }) =>
  new Promise(async (resolve, reject) => {
    const zip = new JSZip();

    const loadData = require("./loadData");
    const data = await loadData(workId, zip);

    addRecursive(zip, data, path.join(__dirname, "template"));

    const outputDir = path.join(cwd, output);
    mkdirp.sync(outputDir);
    const sketch = path.join(cwd, output, workId + ".sketch");

    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream(sketch))
      .on("finish", function() {
        console.log("out.sketch written.");
        const cmd = `eval "$(mdfind kMDItemCFBundleIdentifier == 'com.bohemiancoding.sketch3' | head -n 1)/Contents/Resources/sketchtool/bin/sketchtool export pages ${sketch} --formats=pdf"`;
        console.log(cmd);
        child_process.execSync(cmd);
        console.log("pdf generated!");
        const tmp = "Page 1.pdf"; // Sketch が生成したファイルの名前, output でパスを変更できそうだったが, うまく変えられなかったので, 一時的に cwd に出力している
        fs.renameSync(tmp, path.join(outputDir, workId + ".pdf"));
        resolve();
      });
  });
