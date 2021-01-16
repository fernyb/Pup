const puppeteer = require("puppeteer");
const PupPage = require("./pup_page.js");
const PupElement = require("./pup_element.js");

class Pup {
  page;

  constructor(opts={}) {
    this.opts = opts;
    this.browser = null;
    this.page = null;
  }

  useExistingChrome() {
    return this.opts['useExistingChrome'] === true || process.env.USE_EXISTING_CHROME;
  }

  useMobileEmulation() {
    return this.opts['useMobileEmulation'] === true || process.env.USE_MOBILE_EMULATION;
  }

  mobileDeviceName() {
    //return puppeteer.devices['iPad Pro landscape'];
    return puppeteer.devices['iPhone 7 landscape'];
  }

  async newPage(url) {
    if (!this.browser) {
      if (this.useExistingChrome()) {
        this.browser = await puppeteer.connect({
          browserURL: "http://127.0.0.1:9222/",
          ignoreHTTPSErrors: true,
          defaultViewport: null
        });
      } 
      else {
        this.browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
          args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--start-maximized',
            '--disable-setuid-sandbox',
            `--user-data-dir=${USER_DATA_DIR}`
          ]
        });
      }

      this.page = await this.browser.newPage();
    }
    else if (this.page) {
      await this.page.setRequestInterception(false);
      await this.page.close();
      this.page = await this.browser.newPage();
    }

    if (this.useMobileEmulation()) {
      await this.page.emulate(this.mobileDeviceName());
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
    if (this.useExistingChrome()) {
      await this.page.close();
    } else {
      await this.browser.close();
    }
  }
}

module.exports = Pup;
