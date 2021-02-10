const { 
  Pup 
} = require("../lib/index.js");

const ExamplePage = require("../pages/example.js");
const HomePage = require("../pages/home.js");

describe("New Tab", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("link opens new window", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    expect(await p.pages()).toHaveLength(2);

    expect(await examplePage.url()).toBe("http://localhost:3000/public/examples");

    await (await examplePage.newWindowLink()).click({ newPage: true });

    expect(await p.pages()).toHaveLength(3);
    
    expect(await examplePage.url()).toBe("http://localhost:3000/public/examples");

    let page2 = await p.lastPage();
    expect(await page2.url()).toBe("http://localhost:3000/");

    let homePage = new HomePage(page2);
    expect(await homePage.url()).toBe("http://localhost:3000/");

    await homePage.wait(3000);

    await homePage.close();

    await page.wait(3000);

    done();
  });
});
