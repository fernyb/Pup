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
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    expect(await p.pages()).toHaveLength(2);

    expect(await examplePage.url()).toBe(`http://${TEST_APP_HOST}:3000/public/examples`);

    await (await examplePage.newWindowLink()).click({ newPage: true });

    expect(await p.pages()).toHaveLength(3);
    
    expect(await examplePage.url()).toBe(`http://${TEST_APP_HOST}:3000/public/examples`);

    let page2 = await p.lastPage();
    expect(await page2.url()).toBe(`http://${TEST_APP_HOST}:3000/`);

    let homePage = new HomePage(page2);
    expect(await homePage.url()).toBe(`http://${TEST_APP_HOST}:3000/`);
    await homePage.wait(3000);
    await homePage.close();
    await page.wait(1000);

    expect(await p.pages()).toHaveLength(2);
    await (await examplePage.newWindowLink()).click({ newPage: true });
    expect(await p.pages()).toHaveLength(3);

    page2 = await p.lastPage();
    expect(await page2.url()).toBe(`http://${TEST_APP_HOST}:3000/`);

    homePage = new HomePage(page2);
    expect(await homePage.url()).toBe(`http://${TEST_APP_HOST}:3000/`);

    await p.activateTabAtIndex(1);
    await examplePage.wait(2000);

    await (await examplePage.newWindowLink()).click({ newPage: true });
    expect(await p.pages()).toHaveLength(4);
    await examplePage.wait(2000);

    await p.activateTabAtIndex(0);
    await examplePage.wait(500);

    await p.activateTabAtIndex(1);
    await examplePage.wait(500);

    await examplePage.activateTab();
    await examplePage.wait(500);

    await p.activateTabAtIndex(2);
    await examplePage.wait(200);

    await examplePage.activateTab();
    await examplePage.wait(200);

    await p.activateTabAtIndex(3);
    await examplePage.wait(200);

    await examplePage.activateTab();
    await examplePage.wait(200);

    await p.activateTabAtIndex(3);
    await examplePage.wait(200);

    await p.activateTabAtIndex(2);
    await examplePage.wait(200);

    await p.closePageAtIndex(3);
    await examplePage.wait(500);

    expect(await p.pages()).toHaveLength(3);

    await examplePage.activateTab();
    await examplePage.close();
    await examplePage.wait(100);

    expect(await p.pages()).toHaveLength(2);

    let url = await (await p.pages())[0].url();
    expect(url).toBe("about:blank");

    url = await (await p.pages())[1].url();
    expect(url).toBe(`http://${TEST_APP_HOST}:3000/`);

    const urls = (await p.pages()).map(async (el) => { 
      return (await el.url());
    });

    const allUrls = await Promise.all(urls);

    expect(allUrls[0]).toBe("about:blank");
    expect(allUrls[1]).toBe(`http://${TEST_APP_HOST}:3000/`);

    done();
  });
});
