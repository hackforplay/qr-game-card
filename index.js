
const url = "https://www.hackforplay.xyz/works/DiO7qmB9Oql8yzv8A087";

const result = /^https?\:\/\/(www\.)?hackforplay\.xyz\/works\/(\w+)/.exec(url);
const workId = result && result[2];
if (!result || typeof workId !== "string") {
  throw new Error("Invalid URL");
}

const generate = require("./generate");
generate(workId);
