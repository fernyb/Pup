const fs = require("fs");
const path = require("path");
const css2xpath = require("css2xpath");

class PupBase {
  constructor() {
  }

  async context() {
    if (!this.element) {
      return await this.page();
    } else {
      return this.element;
    }
  }

  get selectorScope() {
    let currentPup = this;
    let selectorsPath = [];
    while(true) {
      if (currentPup) {
        selectorsPath.unshift(currentPup.rootQuery);
        currentPup = currentPup.pup
        if (currentPup && currentPup.constructor.name == "PupPageBase") {
          break;
        }
      } else {
        break;
      }
    }
    return selectorsPath.join(' ');
  }

  css2xpath(css) {
    return css2xpath(css);
  }

  async findPage() {
    if((await this.context()).waitForXPath) {
      return this;
    } else {
      let currentPup = this;
      while(true) {
        let _context = await currentPup.context();
        if (_context.waitForXPath) {
          break;
        }
        currentPup = currentPup.pup;
      }
      return currentPup;
    }
  }

  async findPageContext() {
    return await (await this.findPage()).context();
  }

  // https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pagewaitforxpathxpath-options
  // waitForXPath is only defined at the page level
  async waitForXPath(xpath, options={}) {
    let _pageContext = await this.findPageContext();
    return await _pageContext.waitForXPath(xpath, options);
  }

  async findXPathElements(xpath) {
    //return await this.findPageContext().$x(xpath);
    //let _context = await this.context();
    let _context = await this.context();
    //let _context = await this.findPageContext();
    return await _context.$x(xpath);
  }

  async findAndWaitForElements(cssSelector) {
    let currentSelectorScope = this.selectorScope;
    let xpath;
    if (currentSelectorScope.length > 0) {
      let targetSelector = `${currentSelectorScope} ${cssSelector}`;
      xpath = this.css2xpath(targetSelector);
    } else {
      xpath = this.css2xpath(cssSelector);
    }

    await this.waitForXPath(xpath); // default wait is 30 seconds
    return await this.findXPathElements(css2xpath(cssSelector));
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
    return await (await this.context()).screenshot(opts);
  }

  async takeScreenshot() {
    await this.screenshot({
      path: "./screenshots/"+ Date.now() +".png",
      fullPage: false
    });
  }

  async centerPoint() {
    const boundingBox = await (await this.context()).boundingBox();
    return {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2
    };
  }

  async tap(point=null) {
    const atPoint = point ? point : (await this.centerPoint());
    return await (
      await this.findPageContext()
    ).touchscreen.tap(atPoint.x, atPoint.y);
  }
}


module.exports = PupBase;
