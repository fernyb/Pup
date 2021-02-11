const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Intercept", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("GET intercept without respond", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    examplePage.onAlertAccept();

    examplePage.onRequestIntercept({
      pattern: /slow_response/,
      methods: ["GET"],
      collect: true
    });

    examplePage.onResponseIntercept({
      pattern: /slow_response/,
      methods: ["GET"],
      collect: true
    });

    await (await examplePage.ajaxBtn()).click();
    await examplePage.waitForAlertToFinish();

    // GET Request
    let requests = await examplePage.waitForRequestIntercept();
    expect(requests.length).toBe(1);
    let req = requests[0];
    expect(req['url']).toEqual("http://localhost:3000/public/slow_response?inactive=true");
    expect(req['method']).toEqual("GET");

    // GET Response
    let responses = await examplePage.waitForResponseIntercept();
    expect(responses.length).toBe(1);
    let res = responses[0];
    expect(res['url']).toEqual("http://localhost:3000/public/slow_response?inactive=true");
    expect(res['method']).toEqual("GET");
    expect(res['body']).toEqual('{"hello":"world"}');

    await examplePage.waitForSelector(".ajax-response");
    let element = await examplePage.ajaxResponseElement();
    let html = await element.innerHTML();
    expect(html).toEqual('{"hello":"world"}');

    debugger
    done();
  });

  test("GET intercept with respond", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    await examplePage.onAlertAccept();
    examplePage.onRequestIntercept({
      pattern: /slow_response/,
      methods: ["GET"],
      respond: {
        contentType: 'application/json',
        body: '{"world":"hello"}'
      }
    });

    examplePage.onResponseIntercept({
      pattern: /slow_response/,
      methods: ["GET"],
      collect: true
    });

    await (await examplePage.ajaxBtn()).click();
    await examplePage.waitForAlertToFinish();

    // GET Response
    let responses = await examplePage.waitForResponseIntercept();
    expect(responses.length).toBe(1);
    let res = responses[0];
    expect(res['url']).toEqual("http://localhost:3000/public/slow_response?inactive=true");
    expect(res['method']).toEqual("GET");
    expect(res['body']).toEqual('{"world":"hello"}');

    await examplePage.waitForSelector(".ajax-response");
    let element = await examplePage.ajaxResponseElement();
    let html = await element.innerHTML();
    expect(html).toEqual('{"world":"hello"}');

    done();
  });

  test("POST intercept without respond", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    examplePage.onRequestIntercept({
      pattern: /slow_response/,
      methods: ["POST"],
      collect: true
    });

    await (await examplePage.postButton()).click();
    let requests = await examplePage.waitForRequestIntercept();

    console.log(requests);
    expect(requests.length).toBe(1);

    let req = requests[0];
    expect(req['url']).toEqual("http://localhost:3000/public/slow_response");
    expect(req['method']).toEqual("POST");
    expect(req['postData']).toEqual("user_id=100&inactive=true");

    await examplePage.waitForSelector(".ajax-response");

    let element = await examplePage.ajaxResponseElement();

    let html = await element.innerHTML();
    expect(html).toEqual('{"method":"POST","request":true}');

    done();
  });

  test("POST intercept with respond", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    await page.setRequestInterception(true);

    let examplePage = new ExamplePage(page);
    examplePage.onRequestIntercept({
      pattern: /slow_response/,
      methods: ["POST"],
      collect: true,
      respond: {
        contentType: 'application/json',
        body: '{"request":false,"intercept":true,"method":"POST"}'
      }
    });

    await (await examplePage.postButton()).click();
    let requests = await examplePage.waitForRequestIntercept();

    console.log(requests);
    expect(requests.length).toBe(1);

    let req = requests[0];
    expect(req['url']).toEqual("http://localhost:3000/public/slow_response");
    expect(req['method']).toEqual("POST");
    expect(req['postData']).toEqual("user_id=100&inactive=true");

    await examplePage.waitForSelector(".ajax-response");

    let element = await examplePage.ajaxResponseElement();

    let html = await element.innerHTML();
    expect(html).toEqual('{"request":false,"intercept":true,"method":"POST"}');

    done();
  });

});
