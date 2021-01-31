const fs = require("fs");
const util = require("util");
const path = require("path");

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);

const readDownloadDir = async function() {
  return (await readdir(DOWNLOAD_DIR)).map(f => path.join(DOWNLOAD_DIR, f));
};

const readDownloadedFile = async function(file, options={}) {
  let _options = Object.assign({}, { encoding: "utf8" }, options);
  return await readfile(file, _options);
};

module.exports = {
  readDownloadDir,
  readDownloadedFile
};
