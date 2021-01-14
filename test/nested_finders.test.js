const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Nested Finders", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("find within", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");

    let examplePage = new ExamplePage(page);
    let nestedRoot = await examplePage.nestedRoot();

    let textContainer = await nestedRoot.firstParagraphContainer();
    console.log(textContainer);
    done();
  });
});
