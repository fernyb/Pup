const {
  Pup,
  PupPage
} = require("../lib/index.js");

class HomePage extends PupPage {
  constructor(pup) {
    super(pup);
  }

  get rootQuery() {
    return "body";
  }
}

module.exports = HomePage;
