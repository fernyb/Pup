const { 
  Pup, 
  readDownloadDir, 
  readDownloadedFile 
} = require("../lib/index.js");

const ExamplePage = require("../pages/example.js");
const NewPostPage = require("../pages/new_post.js");

describe("Download / Upload", () => {
  let p = null;

  beforeAll(() => {
    p = new Pup();
  });

  afterAll(async () => {
    await p.close();
  });

  test("Download", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/public/examples`);
    let examplePage = new ExamplePage(page);

    await (await examplePage.downloadBtn()).click();
    await examplePage.wait(1000);

    let files = await readDownloadDir();
    let downloadedFile = files.filter(f => /happy\.txt/.test(f))[0];

    expect(downloadedFile).toMatch(/\/happy\.txt/);

    let contents = await readDownloadedFile(downloadedFile);

    expect(contents).toMatch(/Be Happy/);

    done();
  });

  test("Upload", async (done) => {
    let page = await p.newPage(`http://${TEST_APP_HOST}:3000/posts/new`);
    let newPostPage = new NewPostPage(page);

    let fileChooser = newPostPage.waitForFileChooser();
    let inputBtn = await newPostPage.imageChooseFileInput();

    // waitForFileChooser must be called before the file chooser is launched.
    await inputBtn.click();
    let chooser = await fileChooser;
    await chooser.accept([`${ROOT_DIR}/images/sunflower1.jpg`]);

    expect(await chooser.isMultiple()).toBeFalsy();

    const postPage = await newPostPage.clickSubmitBtn();
    let message = await (await postPage.flashNotice()).innerText();
    expect(message).toBe("Post was successfully created.");

    let src = await (await postPage.imageElement()).getProperty("src");
    expect(src).toMatch(/sunflower1\.jpg$/);

    done();
  });
});
