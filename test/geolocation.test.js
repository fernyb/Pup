const P = require("../lib/index.js");

describe("PupApp Geolocation", () => {
  let p = null;

  beforeAll(() => {
    p = new P.Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("accept geolocation", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");

    await page.allowGeolocation({
      latitude: 33.980385999999996,
      longitude: -118.08758439999998
    });

    let btn = await page.findBySelector("button:contains('Get Current GeoLocation')");
    await btn.click();

    let divLat = await page.waitAndFindSelector(".geolocation_results div:contains('Latitude')");
    expect(await divLat.innerText()).toEqual("Latitude: 33.980385999999996");

    let divLon = await page.findBySelector(".geolocation_results div:contains('Longitude')");
    expect(await divLon.innerText()).toEqual("Longitude: -118.08758439999998");

    await page.wait(3000);

    done();
  });
});
