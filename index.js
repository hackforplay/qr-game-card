const commander = require("commander");
const packageJson = require("./package.json");

commander
  .version(packageJson.version, "-v, --version")
  .usage("[options] <url ...>")
  .option(
    "-o, --output [value]",
    "Where to output the generated files - defaults to the current working directory (optional)."
  )
  .parse(process.argv);

if (commander.args.length < 1) {
  console.log("url not given.");
}

for (const url of commander.args) {
  const result = /^https?\:\/\/(www\.)?hackforplay\.xyz\/works\/(\w+)/.exec(
    url
  );
  const workId = result && result[2];
  if (!result || typeof workId !== "string") {
    console.error(`Invalid URL: ${url}`);
    continue;
  }

  const generate = require("./generate");
  generate(workId, commander);
}
