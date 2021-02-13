const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Alert", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
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
});

