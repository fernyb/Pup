const P = require("../lib/index.js");

class SectionNode extends P.PupElement {
  constructor(context, element) {
    super(context, element);
  }

  get rootQuery() {
    return "section[name=top]";
  }

  async headerNode() {
    let nodes = await this.findAndWaitForElements("div.header");
    return new HeaderNode(this, nodes[0]);
  }
}

class HeaderNode extends P.PupElement {
  constructor(context, element) {
    super(context, element);
  }

  get rootQuery() {
    return "div.header";
  }

  async headerTitleNode() {
    let nodes = await this.findAndWaitForElements("h3");
    return new P.PupElement(this, nodes[0]);
  }
}

class NestChild extends P.PupElement {
  constructor(context, element) {
    super(context, element);
  }

  get rootQuery() {
    return ".nest_child";
  }

  async hasImage() {
    let nodes = await this.allImageElements();
    return nodes.length > 0;
  }

  async allImageElements() {
    return await this.findAndWaitForElements("img");
  }
}

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

  async allParagraphContainers() {
    let nodes = await this.findAndWaitForElements("p");
    return nodes.map(x => new P.PupElement(this, x));
  }

  async nestedChildrenContainers() {
    let nodes = await this.findAndWaitForElements(".nest_child");
    return nodes.map(x => new NestChild(this, x));
  }

  async topSectionNode() {
    let nodes = await this.findAndWaitForElements("section[name=top]");
    return new SectionNode(this, nodes[0]);
  }
}

module.exports = NestedRoot;
