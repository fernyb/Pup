const {
  Pup,
  PupElement
} = require("../lib/index.js");

describe("PupApp Geolocation", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("accept geolocation", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);

    await page.allowGeolocation({
      latitude: 33.980385999999996,
      longitude: -118.08758439999998
    });

    let btnRaw= await page.findBySelector("button:contains('Get Current GeoLocation')");
    let btn = new PupElement(page, btnRaw);
    await btn.click();

    let divLatRaw = await page.waitAndFindSelector(".geolocation_results div:contains('Latitude')");
    let divLat = new PupElement(page, divLatRaw);
    expect(await divLat.innerText()).toEqual("Latitude: 33.980385999999996");

    let divLonRaw = await page.findBySelector(".geolocation_results div:contains('Longitude')");
    let divLon = new PupElement(page, divLonRaw);
    expect(await divLon.innerText()).toEqual("Longitude: -118.08758439999998");

    await page.wait(3000);

    done();
  });
});
