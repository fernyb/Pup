const {
  Pup,
  PupPageBase
} = require("../lib/index.js");

class HomePage extends PupPageBase {
  constructor(pup) {
    super(pup);
  }

  get rootQuery() {
    return "body";
  }
}

module.exports = HomePage;
