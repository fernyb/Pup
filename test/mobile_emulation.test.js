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
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
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

    let menuBtn = await page.findBySelector("[aria-label='Toggle navigation']");
    await menuBtn.tap();
    await page.wait(2000);

    let githubMenuItem = await page.findBySelector("summary:contains('Why GitHub')");
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

    let div = await page.findElementWithTag('div');
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
