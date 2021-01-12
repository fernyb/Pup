const fs = require("fs");
const path = require("path");
const css2xpath = require("css2xpath");

class PupBase {
  constructor() {
  }

  get context() {
    return !this.element ? this.page : this.element;
  }

  async findElements(selector) {
    //let xpath = css2xpath(selector);
    /*await this.page.waitForXPath(xpath);*/
    //return await this.page.$x(xpath);
    return await this.context.$$(selector);
  }

  async findElementWithTag(tagName) {
    return await this.findBySelector(tagName);
  }

  async findElementsWithTag(tagName) {
    return await this.findBySelectors(tagName);
  }

  async screenshot(opts={}) {
    let dir = path.dirname(opts['path']);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return await this.context.screenshot(opts);
  }

  async takeScreenshot() {
    await this.screenshot({
      path: "./screenshots/"+ Date.now() +".png",
      fullPage: false
    });
  }
}


module.exports = PupBase;
