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

  test("Cookies", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    await (await examplePage.setCookieBtn()).click();
    let el = await examplePage.waitAndFindSelector(".cookieResponse");
    expect(await el.innerText()).toEqual("Cookie: pupCookie = CookieJar");

    await (await examplePage.clearCookieBtn()).click();
    el = await examplePage.waitAndFindSelector(".cookieResponse");
    expect(await el.innerText()).toEqual("Cookie: pupCookie =");

    done();
  })

  test("Inspect Cookies", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");

    let examplePage = new ExamplePage(page);
    await examplePage.goto("http://localhost:3000/public/examples?test=1");

    examplePage.onResponseIntercept({
      pattern: /cookie/,
      methods: ["GET"],
      collect: true
    });

    let setCookieBtn = await examplePage.setCookieBtn();
    await setCookieBtn.click();

    let response = await examplePage.waitForResponseIntercept();
    expect(response.length).toBe(1);

    let headers = response[0]['headers'];
    expect(headers['set-cookie']).toMatch(/pupCookie=CookieJar; path=\/; expires=([\w:\s,]+); HttpOnly/);

    let cookies = await examplePage.cookies();
    let pupCookie = cookies.find(x => x['name'] == 'pupCookie')
    expect(pupCookie).toHaveProperty('name', 'pupCookie');
    expect(pupCookie).toHaveProperty('value', 'CookieJar');
    expect(pupCookie).toHaveProperty('path', '/');
    expect(pupCookie).toHaveProperty('httpOnly', true);

    await (await examplePage.clearCookieBtn()).click();
    response = await examplePage.waitForResponseIntercept();
    expect(response.length).toBe(1);

    headers = response[0]['headers'];
    expect(headers['set-cookie']).toMatch(/pupCookie=; path=\/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT/);

    cookies = await examplePage.cookies();
    pupCookie = cookies.find(x => x['name'] == 'pupCookie')
    expect(pupCookie).toBeUndefined();

    done();
  })
});
