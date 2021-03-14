const {
  Pup,
  PupElement
} = require("../lib/index.js");
const ExamplePage = require("../pages/example.js");

describe("iframe", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("iframe click, custom timeout", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
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

