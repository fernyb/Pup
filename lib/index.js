const puppeteer = require("puppeteer");
const css2xpath = require("css2xpath");


class PupElement {
  constructor(element) {
    this.element = element;
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
  }

  async content() {
    return await this.pup.page.content();
  }

  get page() {
    return this.pup.page;
  }

  async title() {
    return await this.page.title();
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
    let xpath = css2xpath(selector);
    /*await this.page.waitForXPath(xpath);*/
    return await this.page.$x(xpath);
  }

  async findBySelectors(selector) {
    let _elements = await this.findElements(selector);
    let retElements = [];
    for(var i=0; i<_elements.length; i++) {
      retElements.push(new PupElement(_elements[i]));
    }
    return retElements;
  }

  async findBySelector(selector) {
    let elements = await this.findElements(selector);
    return new PupElement(elements[0]);
  }

  async findElementWithTag(tagName) {
    return await this.findBySelector(tagName);
  }

  async findElementsWithTag(tagName) {
    return await this.findBySelectors(tagName);
  }
}

class Pup {
  page;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  async newPage(url) {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
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
    return new PupElement(elements[0]);
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
