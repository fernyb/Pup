const {
  Pup,
  PupElement
} = require("../lib/index.js");
const ExamplePage = require("../pages/example.js");

describe("Drag N Drop", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("drag n drop", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    let rposEl = await examplePage.dragBoxPosElement();
    let posEl = new PupElement(examplePage, rposEl);

    let rel = await examplePage.dragBoxElement();
    let el = new PupElement(examplePage, rel);

    await el.mouseDown();

    await el.mouseMove(40, 40);
    await page.wait(500);
    expect(await posEl.innerText()).toMatch(/top: 10, left: 10/);

    await el.mouseMove(900, 40);
    await page.wait(500);
    expect(await posEl.innerText()).toMatch(/top: 10, left: 870/);

    await el.mouseMove(900, 691);
    await page.wait(500);
    expect(await posEl.innerText()).toMatch(/top: 661, left: 870/);

    await el.mouseMove(45, 691);
    await page.wait(500);
    expect(await posEl.innerText()).toMatch(/top: 661, left: 15/);

    await el.mouseUp();

    done();
  });
});
