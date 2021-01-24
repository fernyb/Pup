const Pup = require("../lib/index.js").Pup;
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
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    let posEl = await examplePage.dragBoxPosElement();
    let el = await examplePage.dragBoxElement();
    await el.mouseDown();

    await el.mouseMove(40, 40);
    expect(await posEl.innerText()).toMatch(/top: 10, left: 10/);

    await el.mouseMove(900, 40);
    expect(await posEl.innerText()).toMatch(/top: 10, left: 870/);

    await el.mouseMove(900, 691);
    expect(await posEl.innerText()).toMatch(/top: 661, left: 870/);

    await el.mouseMove(45, 691);
    expect(await posEl.innerText()).toMatch(/top: 661, left: 15/);

    await el.mouseUp();

    done();
  });
});
