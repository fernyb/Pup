const {
  Pup,
  PupPageBase,
  PupElement
} = require("../lib/index.js");
const NestedRoot = require("../components/nested_root.js");

class ExamplePage extends PupPageBase {
  constructor(pup) {
    super(pup);
  }

  get rootQuery() {
    return "body";
  }

  async nestedRoot() {
    let nodes = await this.findAndWaitForElements("div#nest_root");
    return new NestedRoot(this, nodes[0]);
  }

  async setCookieBtn() {
    let els = await this.findAndWaitForElements("button:contains('Set Cookie')");
    return new PupElement(this, els[0]);
  }

  async clearCookieBtn() {
    let els = await this.findAndWaitForElements("button:contains('Clear Cookie')");
    return new PupElement(this, els[0]);
  }

  async appVersionContainer() {
    let els = await this.findAndWaitForElements("[name=headers] div");
    return new PupElement(this, els[0]);
  }

  async downloadBtn() {
    let els = await this.findAndWaitForElements("button[name=download]");
    return new PupElement(this, els[0]);
  }

  async iFrameBtn() {
    let els = await this.findElements("#iframe-toggle");
    return (new PupElement(this, els[0]));
  }

  async dragBoxElement() {
    return await this.waitAndFindSelector("#makeMeDraggable");
  }

  async dragBoxPosElement() {
    return await this.waitAndFindSelector("#draggablePosition");
  }

  async rightclickElement() {
    return this.waitAndFindSelector("section[name=rightClick] "+
      "div:contains('Right Click Here') div").then((el) => {
        return new PupElement(this, el);
      });
  }

  async rightclickResultElement() {
    return this.waitAndFindSelector("[name=rightclickResult]").then((el) => {
      return new PupElement(this, el);
    });
  }

  async timezoneElement() {
    return this.waitAndFindSelector("[name=currentTimezone]").then((el) => {
      return new PupElement(this, el);
    });
  }

  async messageTextElement() {
    return this.findAndWaitForElements("p:contains('Contact Us')").then((elements) => {
      return new PupElement(this, elements[0]);
    });
  }

  async getH1Tag() {
    let xpath = this.css2xpath("h1:contains('Examples')");
    await this.waitForXPath(xpath);
    return await this.findByXpath(xpath);
  }

  async newWindowLink() {
    let el = await this.waitAndFindSelector("a:contains('New Window target')");
    return new PupElement(this, el);
  }

  async iFrameElement(callback) {
    let els = await this.findElements("iframe");
    callback(els[0]);
  }

  async elementToggleBtn() {
    let els = await this.findElements("#element-toggle");
    return new PupElement(this, els[0]);
  }

  async clickableLink() {
    let els = await this.findElements("a#no-click");
    return new PupElement(this, els[0]);
  }

  async h1Title() {
    return this.findElementWithTag("h1").then((el) => {
      return new PupElement(this, el);
    });
  }

  async delayAlertBtn() {
    let els = await this.findElements("#delay-alert");
    return new PupElement(this, els[0]);
  }

  async ajaxBtn() {
    let els = await this.findElements("#get-response");
    return new PupElement(this, els[0]);
  }

  async postButton() {
    let els = await this.findElements("#post-response");
    return new PupElement(this, els[0]);
  }

  async ajaxResponseElement() {
    let els = await this.findElements(".ajax-response");
    return new PupElement(this, els[0]);
  }
}

module.exports = ExamplePage;
