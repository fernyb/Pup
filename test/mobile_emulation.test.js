const {
  Pup,
  PupElement
} = require("../lib/index.js");
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
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    await page.waitForSelector("#element-toggle");

    let elraw = await page.findBySelector("a#no-click");
    let el = new PupElement(page, elraw);
    await el.click();

    // verify we do not navigate
    let h1raw = await page.findElementWithTag("h1");
    let h1 = new PupElement(page, h1raw);
    expect(await h1.innerText()).not.toEqual("Posts");

    // toggle the element so the link is clickable
    let btnraw = await page.findBySelector("button#element-toggle");
    let btn = new PupElement(page, btnraw);
    await btn.click();

    await el.click();
    await page.waitForText("Posts");

    // we should be at the root page /
    h1raw = await page.findElementWithTag("h1");
    h1 = new PupElement(page, h1raw);
    expect(await h1.innerText()).toEqual("Active Posts");

    await page.wait(3000);

    done();
  });

  test("view source code", async (done) => {
    let page = await p.newPage("https://github.com/puppeteer/puppeteer/blob/v5.5.0/src/common/DeviceDescriptors.ts");
    await page.wait(2000);

    await (await page.mouse()).move(100, 100);

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

  test("tap", async (done) => {
    let page = await p.newPage("https://github.com/puppeteer/puppeteer/blob/v5.5.0/src/common/DeviceDescriptors.ts");
    await page.wait(2000);

    let menuBtnRaw = await page.findBySelector("[aria-label='Toggle navigation']");
    let menuBtn = new PupElement(page, menuBtnRaw);
    await menuBtn.tap();
    await page.wait(2000);

    let githubMenuItemRaw = await page.findBySelector("summary:contains('Why GitHub')");
    let githubMenuItem = new PupElement(page, githubMenuItemRaw);

    let point = await githubMenuItem.centerPoint();
    await (await page.mouse()).move(point.x, point.y);
    await githubMenuItem.tap();
    await page.wait(1000);

    await page.scroll(100);
    await page.wait(1000);

    await page.scroll(100);
    await page.wait(1000);

    await page.scroll(100);
    await page.wait(1000);

    done();
  });

  test("scroll up /down", async (done) => {
    let page = await p.newPage("https://mdn.mozillademos.org/en-US/docs/Web/API/Element/wheel_event$samples/Scaling_an_element_via_the_wheel?revision=1587366");
    await page.wait(2000);

    let divraw = await page.findElementWithTag('div');
    let div = new PupElement(page, divraw);
    let centerPoint = await div.centerPoint();

    await (await page.mouse()).move(centerPoint.x, centerPoint.y);
    for(let i=0; i<5; i++) {
      await page.scroll(-20);
      await page.wait(500);
    }

    for(let i=0; i<7; i++) {
      await page.scroll(10);
      await page.wait(500);
    }

    await page.wait(2000);

    done();
  });
});
