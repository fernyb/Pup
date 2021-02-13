const Pup = require("../lib/index.js").Pup;
const ExamplePage = require("../pages/example.js");

describe("Timezone", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async (done) => {
    await p.close();
    done();
  });

  test("timezone", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    let el = await examplePage.timezoneElement();
    let zone = await el.innerText();
    expect(zone).toMatch(/GMT-0800 \(Pacific Standard Time\)/);

    done();
  });

  test("set timezone", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    // Set the initial timezone
    await examplePage.emulateTimezone("America/Los_Angeles");
    await examplePage.reload();

    let el = await examplePage.timezoneElement();
    let zone = await el.innerText();
    expect(zone).toMatch(/GMT-0800 \(Pacific Standard Time\)/);

    // https://source.chromium.org/chromium/chromium/deps/icu.git/+/faee8bc70570192d82d2978a71e2a615788597d1:source/data/misc/metaZones.txt
    // use a different timezone
    await examplePage.emulateTimezone("America/New_York");
    await examplePage.reload();

    el = await examplePage.timezoneElement();
    zone = await el.innerText();
    expect(zone).not.toMatch(/GMT-0800 \(Pacific Standard Time\)/);
    expect(zone).toMatch(/GMT-0500 \(Eastern Standard Time\)/);

    await examplePage.reload();

    el = await examplePage.timezoneElement();
    zone = await el.innerText();
    expect(zone).not.toMatch(/GMT-0800 \(Pacific Standard Time\)/);
    expect(zone).toMatch(/GMT-0500 \(Eastern Standard Time\)/);

    // reset timezone to default
    await examplePage.emulateTimezone(null);

    await examplePage.reload();
    el = await examplePage.timezoneElement();
    zone = await el.innerText();

    // this will fail if your browser is not in America/Los_Angeles
    expect(zone).toMatch(/GMT-0800 \(Pacific Standard Time\)/);

    done();
  });
});
