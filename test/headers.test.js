const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Headers", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("Get Headers", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");

    let examplePage = new ExamplePage(page);
    await examplePage.setRequestInterception(true);

    examplePage.onRequestIntercept({
      pattern: /.*/,
      methods: ["GET"],
      collect: true
    });

    await examplePage.reload();

    let responses = await examplePage.waitForRequestIntercept();
    let requests = responses.filter(x => x.isNavigationRequest);
    let headers = requests[0]['headers'];

    expect(headers).toHaveProperty('user-agent');

    done();
  });

  test("Set Header", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");

    let examplePage = new ExamplePage(page);
    await examplePage.setRequestInterception(true);

    examplePage.onRequestIntercept({
      pattern: /.*/,
      methods: ["GET"],
      collect: true,
      setHeaders: {
        AppVersion: "1.0"
      }
    });

    await examplePage.reload();

    let responses = await examplePage.waitForRequestIntercept();
    let requests = responses.filter(x => x.isNavigationRequest);
    let headers = requests[0]['headers'];

    expect(headers).toHaveProperty('user-agent');
    expect(headers).toHaveProperty('AppVersion', '1.0');

    let appVersionContainer = (await examplePage.appVersionContainer());
    let appVersionText = await appVersionContainer.innerText();

    expect(appVersionText).toMatch(/AppVersion: 1.0/);

    done();
  });

});
