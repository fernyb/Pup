const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("PupApp Mobile", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup({
      useMobileEmulation: true
    });
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

    await page.wait(3000);

    done();
  });

  test("view source code", async (done) => {
    let page = await p.newPage("https://github.com/puppeteer/puppeteer/blob/v5.5.0/src/common/DeviceDescriptors.ts");
    await page.wait(2000);

    await page.mouse.move(100, 100);

    for(let i=0; i<50; i++) {
      await page.scroll(400);
      await page.wait(100);
    }

    for(let i=0; i<50; i++) {
      await page.scroll(-400);
      await page.wait(100);
    }

    done();
  });
});
