const P = require("../lib/index.js");

class ExamplePage extends P.PupPage {
  constructor(pup) {
    super(pup);
  }

  async elementToggleBtn() {
    let els = await this.findElements("#element-toggle");
    if (els.length > 0) {
      return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
  }

  async clickableLink() {
    let els = await this.findElements("a#no-click");
    if (els.length > 0) {
      return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
  }

  async h1Title() {
    return await this.findElementWithTag("h1");
  }
}

module.exports = ExamplePage;
