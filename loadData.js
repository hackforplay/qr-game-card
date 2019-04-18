const fetch = require("node-fetch");
const md5 = require("md5");
const qrcode = require("qrcode");
const os = require("os");
const path = require("path");
const fs = require("fs");

const loadWork = async url => {
  const workDocResponse = await fetch(url);
  if (!workDocResponse.ok) {
    throw new Error(workDocResponse.statusText);
  }
  const workDocJson = await workDocResponse.text();
  const work = JSON.parse(workDocJson);

  return {
    title: work.title,
    author: work.author
  };
};

const loadImage = async (url, zip) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const newPath = `images/${md5(url)}.png`;
  zip.file(newPath, buffer);
  return newPath;
};

const loadQRImage = async (url, width, zip) => {
  const fileName = md5(url) + ".png";
  const tmpPath = path.join(os.tmpdir(), fileName);
  await qrcode.toFile(tmpPath, url, {
    type: "png",
    width
  });
  const buffer = fs.readFileSync(tmpPath);
  fs.unlinkSync(tmpPath);
  const newPath = `images/${fileName}`;
  zip.file(newPath, buffer);
  return newPath;
};

module.exports = async (workId, zip) => {
  const data = await loadWork(
    `https://www.hackforplay.xyz/api/works/${workId}`
  );

  data.qr = await loadQRImage(
    `https://www.hackforplay.xyz/qr/${workId}`,
    75,
    zip
  );

  data.thumbnail = await loadImage(
    `https://www.hackforplay.xyz/api/works/${workId}/thumbnail`,
    zip
  );

  return data;
};
