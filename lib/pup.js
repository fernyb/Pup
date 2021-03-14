const puppeteer = require("puppeteer");
const PupPageBase = require("./pup_page_base.js");
const PupElement = require("./pup_element.js");

class Pup {
  page;

  constructor(opts={}) {
    this.opts = opts;
    this._browser = null;
    this.page = null;
    this._pages = [];
    this.currentPageIndex = 0;
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

  openPage(page) {
    this._pages.push(page);
    this.page = this._pages[this._pages.length - 1];
  }

  async pageClose(page) {
    await page.setRequestInterception(false);
    await page.close();
  }

  async closePage() {
    await this.pageClose(this.page);
    this._pages.pop();
    this.page = null;
  }

  get browser() {
    return this._browser;
  }

  set browser(browser) {
    this._browser = browser;
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
            '--no-sandbox',
            '--disable-gpu',
            `--user-data-dir=${USER_DATA_DIR}`
          ]
        });
      }

      this.openPage(await this.browser.newPage());
    }
    else if (this.page) {
      await this.closePage();
      this.openPage(await this.browser.newPage());
    }

    await this.page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_DIR
    });

    if (this.useMobileEmulation()) {
      await this.page.emulate(this.mobileDeviceName());
    }

    await this.page.goto(url);
    return (new PupPageBase(this, { pageIndex: this._pages.length }));
  }

  async activateTabAtIndex(pageIndex) {
    let pages = await this.pages();
    await pages[pageIndex].bringToFront();
  }

  async pages() {
    return await this.browser.pages();
  }

  async closePageAtIndex(pageIndex) {
    let pages = await this.pages();
    await this.pageClose(pages[pageIndex]);
  }

  async pageAtIndex(idx=0) {
    return new PupPageBase(this, { pageIndex: idx });
  }

  async lastPage() {
    let pages = await this.pages();
    return this.pageAtIndex(pages.length - 1);
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
