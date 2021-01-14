const P = require("../lib/index.js");

class NestedRoot extends P.PupElement {
  constructor(context, element) {
    super(context, element);
  }

  get rootQuery() {
    return "div#nest_root";
  }

  async firstParagraphContainer() {
    let nodes = await this.findAndWaitForElements("p");
    return new P.PupElement(this, nodes[0]);
  }
}

module.exports = NestedRoot;
