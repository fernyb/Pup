const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Right Click", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("Right Click", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    await (await examplePage.rightclickElement()).rightClick();

    let result = await examplePage.rightclickResultElement();
    expect(await result.innerText()).toEqual("Right Click PASS");

    // regular left click
    await (await examplePage.rightclickElement()).click();

    result = await examplePage.rightclickResultElement();
    expect(await result.innerText()).toEqual("Right Click FAIL");

    done();
  });
});
