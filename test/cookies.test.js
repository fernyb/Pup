const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Cookies", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("Cookies", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    await (await examplePage.setCookieBtn()).click();
    let el = await examplePage.waitAndFindSelector(".cookieResponse");
    expect(await el.innerText()).toEqual("Cookie: pupCookie = CookieJar");

    await (await examplePage.clearCookieBtn()).click();
    el = await examplePage.waitAndFindSelector(".cookieResponse");
    expect(await el.innerText()).toEqual("Cookie: pupCookie =");

    done();
  });

  test("Inspect Cookies", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);

    let examplePage = new ExamplePage(page);
    await examplePage.goto(`http://${TEST_APP_HOST}:3000/public/examples?test=1`);

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

  test("Set Cookie", async (done) => {
    // https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagesetcookiecookies
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    await examplePage.deleteCookie({ name: "cheese" });
    await examplePage.reload();
    await examplePage.wait(2000);

    let cookies = await examplePage.cookies();
    let cookie = cookies.find(x => x['name'] == 'cheese');
    expect(cookie).toBeUndefined();

    let expiresUnixTime = Math.floor(new Date().getTime() / 1000) + Math.floor(60 / 14);

    await examplePage.setCookie({
      name: "cheese",
      value: "blue",
      url: `http://${TEST_APP_HOST}:3000/public/examples`,
      domain: `${TEST_APP_HOST}`,
      path: "/",
      expires: expiresUnixTime,
      httpOnly: true, /* httpOnly cookie would not be acessible throught JS */
      secure: false, /* secure should be set for https sites */
      sameSite: "Lax"
    });

    await examplePage.reload();
    await examplePage.wait(1000);

    cookies = await examplePage.cookies();
    cookie = cookies.find(x => x['name'] == 'cheese');
    expect(cookie).not.toBeUndefined();

    expect(cookie).toHaveProperty('name', 'cheese');
    expect(cookie).toHaveProperty('value', 'blue');
    expect(cookie).toHaveProperty('domain', `${TEST_APP_HOST}`);
    expect(cookie).toHaveProperty('expires', expiresUnixTime);
    expect(cookie).toHaveProperty('path', '/');
    expect(cookie).toHaveProperty('httpOnly', true);
    expect(cookie).toHaveProperty('secure', false);
    expect(cookie).toHaveProperty('sameSite', 'Lax');

    await examplePage.wait(5000); // wait for cookie to expire
    await examplePage.reload();

    cookies = await examplePage.cookies();
    cookie = cookies.find(x => x['name'] == 'cheese');
    expect(cookie).toBeUndefined();

    done();
  });

  test("Delete Cookie", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    let cookies = await examplePage.cookies();
    let cookie = cookies.find(x => x['name'] == 'cheese');
    expect(cookie).toBeUndefined();

    let expiresUnixTime = Math.floor(new Date().getTime() / 1000) + Math.floor(60 / 14);

    await examplePage.setCookie({
      name: "cheese",
      value: "blue",
      url: `http://${TEST_APP_HOST}:3000/public/examples`,
      domain: `${TEST_APP_HOST}`,
      path: "/",
      expires: expiresUnixTime,
      httpOnly: true, /* httpOnly cookie would not be acessible throught JS */
      secure: false, /* secure should be set for https sites */
      sameSite: "Lax"
    });

    await examplePage.reload();

    cookies = await examplePage.cookies();
    cookie = cookies.find(x => x['name'] == 'cheese');
    expect(cookie).not.toBeUndefined();

    await examplePage.deleteCookie({
      name: "cheese"
    });

    await examplePage.reload();
    cookies = await examplePage.cookies();
    cookie = cookies.find(x => x['name'] == 'cheese');
    expect(cookie).toBeUndefined();

    done();
  });
});
