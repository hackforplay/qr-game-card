const JSZip = require("jszip");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");

const cwd = process.cwd();

const findTemplate = template => {
  try {
    const buffer = fs.readFileSync(path.join(cwd, template));
    return buffer;
  } catch (error) {}
  try {
    const preset = path.join(__dirname, "./templates", template + ".sketch");
    const buffer = fs.readFileSync(preset);
    return buffer;
  } catch (error) {
    throw new Error(`Template not found: ${template}`);
  }
};

const generate = async (workId, template) => {
  const findObject = require("./findObject");
  const sketch = findTemplate(template);
  const zip = await JSZip.loadAsync(sketch);

  const { loadWork, loadImage, loadQRImage } = require("./loadData");
  const { title, author } = await loadWork(workId);

  for (const [fileName, zipObject] of Object.entries(zip.files)) {
    if (/pages\/.+\.json$/i.test(fileName)) {
      const json = await zipObject.async("text");
      const page = JSON.parse(json);

      let modified = false;

      const titleNode = findObject(page, "text", "title");
      if (titleNode) {
        titleNode.attributedString.string = title + "　"; // 英語だとフォントが変わる？ので、全角スペースを入れる
        modified = true;
      }
      const authorNode = findObject(page, "text", "author");
      if (authorNode) {
        authorNode.attributedString.string = author + "　"; // 英語だとフォントが変わる？ので、全角スペースを入れる
        modified = true;
      }
      const thumbnailNode = findObject(page, "bitmap", "gameThum");
      if (thumbnailNode) {
        const buffer = await loadImage(workId);
        zip.file(thumbnailNode.image._ref, buffer); // Overwrite
        modified = true;
      }
      const qrNode = findObject(page, "bitmap", "qr");
      if (qrNode) {
        const buffer = await loadQRImage(workId, qrNode.frame.width);
        zip.file(qrNode.image._ref, buffer); // Overwrite
        modified = true;
      }

      if (modified) {
        zip.file(fileName, JSON.stringify(page));
      }
    }
  }
  return zip;
};

module.exports = (workId, { output = "./", template }) =>
  new Promise(async (resolve, reject) => {
    const zip = await generate(workId, template);

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
