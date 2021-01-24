const P = require("../lib/index.js");
const NestedRoot = require("../components/nested_root.js");

class ExamplePage extends P.PupPage {
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
    return new P.PupElement(this, els[0]);
  }

  async clearCookieBtn() {
    let els = await this.findAndWaitForElements("button:contains('Clear Cookie')");
    return new P.PupElement(this, els[0]);
  }

  async iFrameBtn() {
    let els = await this.findElements("#iframe-toggle");
    if (els.length > 0) {
      return (new P.PupElement(this, els[0]));
    } else {
      return null;
    }
  }

  async rightclickElement() {
    return this.waitAndFindSelector("section[name=rightClick] "+
      "div:contains('Right Click Here') div");
  }

  async rightclickResultElement() {
    return this.waitAndFindSelector("[name=rightclickResult]");
  }

  async timezoneElement() {
    return this.waitAndFindSelector("[name=currentTimezone]");
  }

  async messageTextElement() {
    let elements = await this.findAndWaitForElements("p:contains('Contact Us')");
    return new P.PupElement(this, elements[0]);
  }

  async getH1Tag() {
    let xpath = this.css2xpath("h1:contains('Examples')");
    await this.waitForXPath(xpath);
    return await this.findByXpath(xpath);
  }

  async iFrameElement(callback) {
    let els = await this.findElements("iframe");
    if (els.length > 0) {
      callback(els[0]);
      //return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
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

  async delayAlertBtn() {
    let els = await this.findElements("#delay-alert");
    if (els.length > 0) {
      return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
  }

  async ajaxBtn() {
    let els = await this.findElements("#get-response");
    if (els.length > 0) {
      return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
  }

  async postButton() {
    let els = await this.findElements("#post-response");
    if (els.length > 0) {
      return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
  }

  async ajaxResponseElement() {
    let els = await this.findElements(".ajax-response");
    if (els.length > 0) {
      return new P.PupElement(this, els[0]);
    } else {
      return null;
    }
  }
}

module.exports = ExamplePage;
