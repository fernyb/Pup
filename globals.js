const path = require("path");

global.ROOT_DIR = path.join(path.resolve(__dirname));
global.SCREENSHOTS_DIR = path.join(path.resolve(__dirname), "screenshots");
global.USER_DATA_DIR = path.join(path.resolve(__dirname), "user-data");
global.DOWNLOAD_DIR = path.join(path.resolve(__dirname), "downloads");
