const puppeteer = require("puppeteer");
const css2xpath = require("css2xpath");


class PupElement {
  constructor(pup, element) {
    this.pup = pup;
    this.element = element;
  }

  async boxModel() {
    return await this.element.boxModel();
  }

  async getStyle() {
    return await this.pup.page.evaluate((e) => {
      let style = window.getComputedStyle(e);
      let keys = Object.values(style);
      let computedStyles = {};
      for(let i=0; i < keys.length; i++) {
        let k = keys[i];
        computedStyles[k] = style[k];
      }
      return computedStyles;
    }, this.element);
  }

  async isVisible() {
    const style = await this.getStyle();
    const isVisibleFunc = (style) => {
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      );
    };

    const box = await this.boxModel();
    const isVisibleInViewport = await this.element.isIntersectingViewport();

    return (isVisibleFunc(style) && box && isVisibleInViewport);
  }

  async isHidden() {
    return !this.isVisible();
  }

  async getClassNames() {
    let classList = (await this.getProperty("className")).split(" ");
    let classes = [];
    for(var i=0; i<classList.length; i++) {
      classes.push(classList[i]);
    }
    return classes;
  }

  async getProperty(name) {
    return await eval(`this.element.evaluate(el => el.${name}, "*")`);
  }

  async tagName() {
    return await this.getProperty("tagName");
  }

  async innerHTML() {
    return await this.getProperty("innerHTML");
  }

  async innerText() {
    return await this.getProperty("innerText");
  }

  async hover() {
    await this.element.hover();
  }

  async click() {
    await this.element.click();
  }

  async type(str) {
    await this.element.type(str);
  }

  async pressEnter() {
    await this.element.type('\r');
  }

  async screenshot(opts={}) {
    return await this.element.screenshot(opts);
  }

  async takeScreenshot() {
    await this.screenshot({
      path: "./screenshots/el-"+ Date.now() +".png",
      fullPage: false
    });
  }
}

class PupPage {
  constructor(pup) {
    this.pup = pup;
    this._alertDidFinish = null;
    this._alert = {};
  }

  async setRequestInterception(b) {
    await this.pup.page.setRequestInterception(b);
  }

  async reload(options) {
    if (options) {
      return await this.page.reload(options);
    } else {
      return await this.page.reload({
        timeout: 30000,
        waitUntil: "networkidle2"
      });
    }
  }

  async content() {
    return await this.page.content();
  }

  async cookies(urls) {
    let ret = urls ?
      (await this.page.cookies(urls)) : (await this.page.cookies());
    return ret;
  }

  get page() {
    return this.pup.page;
  }

  async title() {
    return await this.page.title();
  }

  async waitForText(text) {
    let xpath = `//*[contains(text(), "${text}")]`;
    await this.page.waitForXPath(xpath);
  }

  async waitForSelector(selector) {
    return await this.page.waitForSelector(selector);
  }

  async waitFor(milliseconds=1000) {
    await this.page.waitForTimeout(milliseconds);
  }

  get mouse() {
    return this.page.mouse;
  }

  async screenshot(opts={}) {
    return await this.page.screenshot(opts);
  }

  async takeScreenshot() {
    await this.screenshot({
      path: "./screenshots/"+ Date.now() +".png",
      fullPage: false
    });
  }

  async findElements(selector) {
    //let xpath = css2xpath(selector);
    /*await this.page.waitForXPath(xpath);*/
    //return await this.page.$x(xpath);
    return await this.page.$$(selector);
  }

  async findBySelectors(selector) {
    let _elements = await this.findElements(selector);
    let retElements = [];
    for(var i=0; i<_elements.length; i++) {
      retElements.push(new PupElement(this, _elements[i]));
    }
    return retElements;
  }

  async findBySelector(selector) {
    let elements = await this.findElements(selector);
    if (elements.length > 0) {
      return new PupElement(this, elements[0]);
    } else {
      return null;
    }
  }

  async findElementWithTag(tagName) {
    return await this.findBySelector(tagName);
  }

  async findElementsWithTag(tagName) {
    return await this.findBySelectors(tagName);
  }

  onAlertAccept() {
    this._alertDidFinish = null;
    var that = this;
    this.page.on("dialog", async (dialog) => {
      that._alert = {
        type: dialog.type(),
        message: dialog.message()
      };
      await dialog.accept();
      that._alertDidFinish = true;
    });
  }

  async waitForAlertToFinish() {
    while(true) {
      await this.page.waitForTimeout(1000);
      if (this._alertDidFinish) {
        break;
      }
    }
    this._alertDidFinish = null;
    return this._alert;
  }

  stubRequest(url, callback) {
    this.page.on('request', (request) => {
      if (request.url() === url) {
        callback(request);
      } else {
        request.continue();
      }
    })
  }
}

class Pup {
  page;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  async newPage(url) {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1200, height: 800 });
    }
    else if (this.page) {
      this.page.close();
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1200, height: 800 });
    }

    await this.page.goto(url);
    return (new PupPage(this));
  }

  async waitForTitle() {
    await this.page.waitForSelector('title');
  }

  async findElementWithText(text) {
    let xpath = `//*[contains(text(), "${text}")]`;
    await this.page.waitForXPath(xpath);
    let elements = await this.page.$x(xpath);
    return new PupElement(this, elements[0]);
  }

  async close() {
    return this.browser.close();
  }
}

module.exports = {
  Pup,
  PupPage,
  PupElement
}
