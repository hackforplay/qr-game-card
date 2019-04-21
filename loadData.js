const fetch = require("node-fetch");
const qrcode = require("qrcode");
const os = require("os");
const path = require("path");
const fs = require("fs");

exports.loadWork = async workId => {
  const workDocResponse = await fetch(
    `https://www.hackforplay.xyz/api/works/${workId}`
  );
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

exports.loadImage = async workId => {
  const response = await fetch(
    `https://www.hackforplay.xyz/api/works/${workId}/thumbnail`
  );
  return await response.buffer();
};

exports.loadQRImage = async (workId, width) => {
  const fileName = workId + "-qr.png";
  const tmpPath = path.join(os.tmpdir(), fileName);
  await qrcode.toFile(tmpPath, `https://www.hackforplay.xyz/qr/${workId}`, {
    type: "png",
    width
  });

  return await new Promise((resolve, reject) => {
    try {
      fs.readFile(tmpPath, (err, data) => {
        if (err) reject(err);
        fs.unlink(tmpPath, err => {
          if (err) reject(err);
          resolve(data);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
