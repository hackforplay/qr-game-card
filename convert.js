const findObject = (object, _class, name) => {
  if (object._class === _class && object.name === name) return object;
  if (Array.isArray(object.layers)) {
    for (const child of object.layers) {
      const result = findObject(child, _class, name);
      if (result !== null) return result;
    }
  }
  return null;
};

module.exports = (data, json) => {
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
};
