const { 
  Pup, 
  readDownloadDir, 
  readDownloadedFile 
} = require("../lib/index.js");

const ExamplePage = require("../pages/example.js");

describe("Download / Upload", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("Download", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    await (await examplePage.downloadBtn()).click();

    await examplePage.wait(2000);

    let files = await readDownloadDir();
    let downloadedFile = files.filter(f => /happy\.txt/.test(f))[0];

    expect(downloadedFile).toMatch(/\/happy\.txt/);

    let contents = await readDownloadedFile(downloadedFile);

    expect(contents).toMatch(/Be Happy/);

    done();
  });

  test("Upload", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);

    done();
  });
});
