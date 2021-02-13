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
});
