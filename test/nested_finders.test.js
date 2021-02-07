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

  test("find within", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");

    let examplePage = new ExamplePage(page);
    let nestedRoot = await examplePage.nestedRoot();

    // find paragraph tags within the nestedRoot container
    let firstParagraphContainer = await nestedRoot.firstParagraphContainer();
    expect(await firstParagraphContainer.innerText()).toEqual("read all about it.");

    let allParagraphElements = await nestedRoot.allParagraphContainers();
    expect(allParagraphElements.length).toBe(4);

    let sectionNode = await nestedRoot.topSectionNode();
    let headerNode = await sectionNode.headerNode();
    let titleNode = await headerNode.headerTitleNode();
    expect(await titleNode.innerText()).toEqual("NEWS!");

    done();
  });

  test("find images", async (done) => {
    let page = await p.newPage("http://localhost:3000/public/examples");
    let examplePage = new ExamplePage(page);
    let nestedRoot = await examplePage.nestedRoot();

//    console.log(nestedRoot.selectorScope);

    let nestedChildren = await nestedRoot.nestedChildrenContainers();
    expect(nestedChildren.length).toBe(3);

//    console.log(`0: ${nestedChildren[0].selectorScope}`);
//    console.log(`1: ${nestedChildren[1].selectorScope}`);
//    console.log(`2: ${nestedChildren[2].selectorScope}`);

    // verify we have an image on the first child
    expect(
      (await nestedChildren[0].allImageElements()).length
    ).toEqual(1);

    expect(await nestedChildren[0].hasImage()).toBeTruthy();

    // verify we do not have images on the second child
    expect(await nestedChildren[1].hasImage()).toBeFalsy();

    expect(await nestedChildren[2].hasImage()).toBeFalsy();

    expect(
      (await nestedChildren[1].allImageElements()).length
    ).toEqual(0);

    expect(
      (await nestedChildren[2].allImageElements()).length
    ).toEqual(0);

    done();
  });
});
