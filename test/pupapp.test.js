const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("PupApp", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("clicking link should not navigate", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.waitForSelector("#element-toggle");

    let el = await page.findBySelector("a#no-click");
    await el.click();

    // verify we do not navigate
    let h1 = await page.findElementWithTag("h1");
    expect(await h1.innerText()).not.toEqual("Posts");

    // toggle the element so the link is clickable
    let btn = await page.findBySelector("button#element-toggle");
    await btn.click();

    await el.click();
    await page.waitForText("Posts");

    // we should be at the root page /
    h1 = await page.findElementWithTag("h1");
    expect(await h1.innerText()).toEqual("Active Posts");

    done();
  });

  test("find using css, h1:contains('Examples')", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    let h1 = await examplePage.getH1Tag();
    expect(await h1.innerText()).toEqual("Examples");

    let h1Tag = await examplePage.findBySelector("h1:contains('Examples')")
    expect(await h1Tag.innerText()).toEqual("Examples");

    done();
  });

  test("auto wait", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    // uses the selector: p:contains('Contact Us')
    // benefit of going this way is reusability. 
    // the selector exist in the method, if selector changes you can update the method.
    let textMessageEl = await examplePage.messageTextElement();
    expect(await textMessageEl.innerText()).toEqual("Thanks for visiting. Contact Us for more information");

    done();
  });

  test("using page object model", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.waitForSelector("#element-toggle");

    let examplePage = new ExamplePage(page);

    let h1 = await examplePage.h1Title();
    expect(await h1.innerText()).toEqual("Examples");

    // using CSS to find h1:contains('Examples')
    let h1Tag = await examplePage.findBySelector("h1:contains('Examples')")
    expect(await h1Tag.innerText()).toEqual("Examples");

    //
    // verify we do not navigate
    await (await examplePage.clickableLink()).click();
    examplePage.waitForTimeout(2000);

    expect(await h1.innerText()).toEqual("Examples");

    // toggle the element so the link is clickable
    await (await examplePage.elementToggleBtn()).click();

    // we should be at the root page /
    await (await examplePage.clickableLink()).click();
    await examplePage.waitForText("Posts");

    h1 = await examplePage.h1Title();
    expect(await h1.innerText()).not.toEqual("Examples");
    expect(await h1.innerText()).toEqual("Active Posts");

    done();
  });

  test("alert", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    examplePage.onAlertAccept();
    await (await examplePage.delayAlertBtn()).click();
    let dialog = await examplePage.waitForAlertToFinish();

    expect(dialog.type).toEqual("alert");
    expect(dialog.message).toEqual("Delayed Hello!");

    done();
  });

  test("ajax with dialog", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);
    examplePage.onAlertAccept();

    await (await examplePage.ajaxBtn()).click();
    await examplePage.waitForAlertToFinish();

    await examplePage.waitForSelector(".ajax-response");

    let element = await examplePage.ajaxResponseElement();

    let html = await element.innerHTML();
    expect(html).toEqual('{"hello":"world"}');

    done();
  });

  test("POST intercept without respond", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    examplePage.onRequestIntercept({
      pattern: /slow_response/,
      methods: ["POST"],
      collect: true
    });

    await (await examplePage.postButton()).click();
    let requests = await examplePage.waitForRequestIntercept();

    console.log(requests);
    expect(requests.length).toBe(1);

    let req = requests[0];
    expect(req['url']).toEqual("http://localhost:3000/public/slow_response");
    expect(req['method']).toEqual("POST");
    expect(req['postData']).toEqual("user_id=100&inactive=true");

    await examplePage.waitForSelector(".ajax-response");

    let element = await examplePage.ajaxResponseElement();

    let html = await element.innerHTML();
    expect(html).toEqual('{"method":"POST","request":true}');

    done();
  });

  test("POST intercept with respond", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    examplePage.onRequestIntercept({
      pattern: /slow_response/,
      methods: ["POST"],
      collect: true,
      respond: {
        contentType: 'application/json',
        body: '{"request":false,"intercept":true,"method":"POST"}'
      }
    });

    await (await examplePage.postButton()).click();
    let requests = await examplePage.waitForRequestIntercept();

    console.log(requests);
    expect(requests.length).toBe(1);

    let req = requests[0];
    expect(req['url']).toEqual("http://localhost:3000/public/slow_response");
    expect(req['method']).toEqual("POST");
    expect(req['postData']).toEqual("user_id=100&inactive=true");

    await examplePage.waitForSelector(".ajax-response");

    let element = await examplePage.ajaxResponseElement();

    let html = await element.innerHTML();
    expect(html).toEqual('{"request":false,"intercept":true,"method":"POST"}');

    done();
  });

  test("iframe click, custom timeout", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);
    await examplePage.wait(3000);

    let btn = await examplePage.iFrameBtn();
    await btn.click();

    await examplePage.wait(3000);

    await examplePage.iFrameElement(async (frameElement) => {
      let rect = await (await examplePage.page()).evaluate((el) => {
        let rect = el.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right
        };
      }, frameElement);

      let x = (rect.right / 2) + rect.left;
      let y = (rect.bottom / 2) + rect.top;
      await (await examplePage.mouse()).move(x, y);

      setTimeout(async function() {
        let frame = await frameElement.contentFrame();
        let playBtn = await frame.$(".ytp-large-play-button.ytp-button,.ytp-play-button.ytp-button");
        await playBtn.click();
      }, 1000);
    });

    await examplePage.wait(30000);

    await examplePage.iFrameElement(async (frameElement) => {
      let rect = await (await examplePage.page()).evaluate((el) => {
        let rect = el.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right
        };
      }, frameElement);

      let x = (rect.right / 2) + rect.left;
      let y = (rect.bottom / 2) + rect.top;
      await (await examplePage.mouse()).move(x, y);

      setTimeout(async function() {
        let frame = await frameElement.contentFrame();
        let btn = await frame.$(".ytp-play-button.ytp-button");
        await btn.click();
      }, 1000);
    });

    await examplePage.wait(5000);

    done();
  }, 60000);
});
