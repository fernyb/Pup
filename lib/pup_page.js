const css2xpath = require("css2xpath");
const PupBase = require("./pup_base.js");
const PupElement = require("./pup_element.js");

class PupPage extends PupBase {
  constructor(pup, opts={}) {
    super();
    this.pup = pup;
    this._alertDidFinish = null;
    this._alert = {};
    this._postRequest = {};

    if (opts['pageIndex'] != "undefined" && opts['pageIndex'] != null) {
      this._pageIndex = opts['pageIndex'];
    } else {
      this._pageIndex = null;
    }
  }

  async close() {
    await this.pup.pup.closePageAtIndex(this.pup._pageIndex);
  }

  pageIndex() {
    if (this._pageIndex == null &&
        this.constructor.name != "PupPage") 
    {
      return this.pup.pageIndex();
    }
    return this._pageIndex;
  }

  async activateTab() {
    this.pup.pup.activateTabAtIndex(this.pup._pageIndex);
  }

  async pages() {
    let _pages = await this.pup.pages();
    return _pages;
  }

  get rootQuery() {
    return "";
  }

  wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async page() {
    let _pageIndex = this.pageIndex();
    if (_pageIndex != null) {
      let _pages = await this.pages();
      return _pages[_pageIndex];
    }

    return this.pup.page;
  }

  async url() {
    let _page = await this.page();
    return await _page.url();
  }

  async goto(url) {
    return await (await this.page()).goto(url);
  }

  async allowGeolocation(pos={}) {
    const browserContext = this.pup.browser.defaultBrowserContext();
    const url = await this.url();
    await browserContext.overridePermissions(url, ['geolocation']);
    return await (await this.page()).setGeolocation({
      latitude: pos.latitude, longitude: pos.longitude
    });
  }

  async waitForNavigation() {
    return await (await this.page()).waitForNavigation();
  }

  async setRequestInterception(b) {
    await (await this.page()).setRequestInterception(b);
  }

  async reload(options) {
    return await (await this.page()).reload(
      options ?? { timeout: 30000, waitUntil: "networkidle2" }
    );
  }

  async content() {
    return (await this.page()).content();
  }

  async cookies(...urls) {
    let _page = await this.page();
    return await _page.cookies(...urls);
  }

  async setCookie(...cookies) {
    await (await this.page()).setCookie(...cookies);
  }

  async deleteCookie(...cookies) {
    await (await this.page()).deleteCookie(...cookies);
  }

  async title() {
    return await (await this.page()).title();
  }

  async waitForText(text) {
    let xpath = `//*[contains(text(), "${text}")]`;
    await (await this.page()).waitForXPath(xpath);
  }

  async waitForSelector(selector) {
    return await (await this.page()).waitForSelector(selector);
  }

  async waitForTimeout(milliseconds=1000) {
    await (await this.page()).waitForTimeout(milliseconds);
  }

  async mouse() {
    return (await this.page()).mouse;
  }

  async scroll(amount=0) {
    await (await this.mouse()).wheel({ deltaY: amount });
  }

  async findByXpath(xpath) {
    let elements = await this.findXPathElements(xpath);
    return (new PupElement(this, elements[0]));
  }

  async findByXpaths(xpath) {
    let elements = await this.findXPathElements(xpath);
    let retElements = [];
    for(var i=0; i<elements.length; i++) {
      retElements.push(new PupElement(this, elements[i]));
    }
    return retElements;
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
      let el = new PupElement(this, elements[0]);
      return el;
    } else {
      return null;
    }
  }

  async waitAndFindSelector(selector) {
    let elements = await this.findAndWaitForElements(selector);
    if (elements.length > 0) {
      return new PupElement(this, elements[0]);
    } else {
      return null;
    }
  }

  async onAlertAccept() {
    this._alertDidFinish = null;
    (await this.page()).on("dialog", (async (dialog) => {
      this._alert = {
        type: dialog.type(),
        message: dialog.message()
      };

      setTimeout((async () => {
        await dialog.accept();
        this._alertDidFinish = true;
      }).bind(this), 1000);
    }).bind(this));
  }


  async waitForAlertToFinish() {
    return new Promise((resolve, reject) => {
      var that = this;
      var tries = 0;
      var _intervalVal;
      _intervalVal = setInterval(function() {
        if (tries < 300) {
          if (that._alertDidFinish) {
            that._alertDidFinish = null;
            clearInterval(_intervalVal);
            resolve(that._alert);
          }
        } else {
          reject(false);
        }
        tries += 1;
      }, 100);
    });
  }

  onRequestIntercept(opts={}) {
    this.onRequest({
      pattern: opts['pattern'],
      methods: opts['methods'],
      collect: opts['collect'],
      respond: opts['respond'],
      setHeaders: opts['setHeaders']
    });
  }

  onRequest(opts) {
    if (!opts['pattern']) {
      throw new Exception("Regex pattern is required");
    }
    if (!opts['methods'] || opts['methods'].length === 0) {
      throw new Exception("At least one HTTP request method is required");
    }

    this._onRequests = [];

    (async () => {
      (await this.page()).on('request', (request) => {
        if (opts['methods'].includes(request.method()) &&
          opts['pattern'].test(request.url())) 
        {
          let headers = null;
          if (opts['setHeaders']) {
            headers = Object.assign({}, request.headers(), opts['setHeaders']);
          }

          if (opts['collect'] === true) {
            let requestParams = {
              url:     request.url(),
              method:  request.method(),
              headers: opts['setHeaders'] ? headers : request.headers(),
              isNavigationRequest: request.isNavigationRequest(),
              postData: null
            };

            if (opts['methods'].includes("POST")) {
              requestParams['postData'] = request.postData();
            }

            this._onRequests.push(requestParams);
          }

          if (opts['respond']) {
            request.respond({
              content: opts['respond']['contentType'],
              body: opts['respond']['body']
            });
            return;
          }

          if (opts['setHeaders']) {
            request.continue({ headers: headers });
            return;
          }
        }

        request.continue();
      });
    }).call(this);
  }

  onResponseIntercept(opts={}) {
    this.onResponse({
      pattern: opts['pattern'],
      methods: opts['methods'],
      collect: opts['collect']
    });
  }

  onResponse(opts) {
    if (!opts['pattern']) {
      throw new Exception("Regex pattern is required");
    }
    if (!opts['methods'] || opts['methods'].length === 0) {
      throw new Exception("At least one HTTP request method is required");
    }

    //var that = this;
    this._onResponses = [];

    (async () => {
      (await this.page()).on('response', (async (response) => {
        if (opts['methods'].includes(response.request().method()) &&
          opts['pattern'].test(response.url())) 
        {
            if (opts['collect'] === true) {
              let params = {
                url:     response.url(),
                status:  response.status(),
                method:  response.request().method(),
                headers: response.headers(),
                isNavigationRequest: response.request().isNavigationRequest()
              }
              if (!params['headers']['location']) {
                params['body'] = await response.text();
              }
              this._onResponses.push(params);
            }
          }
      }).bind(this));
    }).call(this);
  }

  async waitForResponseIntercept() {
    return new Promise((resolve, reject) => {
      var that = this;
      var tries = 0;
      var _intervalVal;
      _intervalVal = setInterval(function() {
        if (tries < 300) {
          if (that._onResponses && that._onResponses.length > 0) {
            let responses = that._onResponses;
            that._onResponses = [];
            clearInterval(_intervalVal);
            resolve(responses);
          }
        } else {
          reject(false);
        }
        tries += 1;
      }, 100);
    });
  }

  async waitForRequestIntercept() {
    return await new Promise((resolve, reject) => {
      let tries = 0;
      let _intervalVal = setInterval((() => {
        if (tries < 300) {
          if (this._onRequests && this._onRequests.length > 0) {
            let requests = this._onRequests;
            this._onRequests = [];
            clearInterval(_intervalVal);
            resolve(requests);
          }
        } else {
          reject(false);
        }
        tries += 1;
      }).bind(this), 100);
    });
  }

  async emulateTimezone(timezoneId /* America/Los_Angeles */) {
    await (await this.page()).emulateTimezone(timezoneId);
  }

  async waitForFileChooser() {
    return (await this.page()).waitForFileChooser();
  }

  async clearLocalStorage() {
    return await (await this.page()).evaluate(() => localStorage.clear());
  }
}

module.exports = PupPage;
