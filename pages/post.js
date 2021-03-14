const {
  PupPageBase,
  PupElement
} = require("../lib/index.js");

class PostPage extends PupPageBase {
  constructor(pup) {
    super(pup);
  }

  get rootQuery() {
    return "body";
  }

  async flashNotice() {
    let els = await this.findAndWaitForElements("p#notice");
    return new PupElement(this, els[0]);
  }

  async imageElement() {
    let els = await this.findAndWaitForElements("p img");
    return new PupElement(this, els[0]);
  }
}

module.exports = PostPage;
