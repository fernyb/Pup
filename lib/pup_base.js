const fs = require("fs");
const path = require("path");
const css2xpath = require("css2xpath");

class PupBase {
  constructor() {
  }

  get context() {
    return !this.element ? this.page : this.element;
  }

  get selectorScope() {
    let currentPup = this;
    let selectorsPath = [];
    while(true) {
      selectorsPath.unshift(currentPup.rootQuery);
      currentPup = currentPup.pup
      if (currentPup) {
        if (currentPup.constructor.name == "PupPage") {
          break;
        }
      }
    }
    return selectorsPath.join(' ');
  }

  css2xpath(css) {
    return css2xpath(css);
  }

  // https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pagewaitforxpathxpath-options
  async waitForXPath(xpath, options={}) {
    return await this.context.waitForXPath(xpath, options);
  }

  async findXPathElements(xpath) {
    return await this.context.$x(xpath);
  }

  async findAndWaitForElements(cssSelector) {
    let currentSelectorScope = this.selectorScope;
    if (currentSelectorScope != '') {
      let targetSelector = `${currentSelectorScope} ${cssSelector}`;
      console.log(this.css2xpath(targetSelector));
    } else {
    }
    let xpath = this.css2xpath(cssSelector);
    await this.waitForXPath(xpath);
    return await this.findXPathElements(xpath);
  }

  async findElements(selector) {
    let xpath = this.css2xpath(selector);
    return await this.findXPathElements(xpath);
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
