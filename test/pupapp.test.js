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
    expect(await h1.innerText()).toEqual("Posts");

    done();
  });

  test("using page object model", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.waitForSelector("#element-toggle");

    let examplePage = new ExamplePage(page);

    let h1 = await examplePage.h1Title();
    expect(await h1.innerText()).toEqual("Examples");
    //
    // verify we do not navigate
    await (await examplePage.clickableLink()).click();
    examplePage.waitFor(2000);

    expect(await h1.innerText()).toEqual("Examples");

    // toggle the element so the link is clickable
    await (await examplePage.elementToggleBtn()).click();

    // we should be at the root page /
    await (await examplePage.clickableLink()).click();
    await examplePage.waitForText("Posts");

    h1 = await examplePage.h1Title();
    expect(await h1.innerText()).not.toEqual("Examples");
    expect(await h1.innerText()).toEqual("Posts");

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

  test("ajax", async (done) => {
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

  test("ajax intercept", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    examplePage.onAlertAccept();
    examplePage.stubSlowResponseEndpoint();

    await (await examplePage.ajaxBtn()).click();
    await examplePage.waitForAlertToFinish();

    await examplePage.waitForSelector(".ajax-response");

    let element = await examplePage.ajaxResponseElement();

    let html = await element.innerHTML();
    expect(html).toEqual('{"world":"hello"}');

    done();
  });
});
