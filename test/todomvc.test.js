const {
  Pup,
  PupElement
} = require("../lib/index.js");
const Todo = require("../pages/todo.js");

require("../matchers/cookie.js");

describe("TodoMVC", () => {
var p = null;

beforeAll(() => {
  p = new Pup();
});

afterAll(async () => {
  await p.close();
});

test("add/delete todo items", async (done) => {
  let page = await p.newPage("http://todomvc.com/examples/vue/#/all");

  await p.waitForTitle();
  await page.clearLocalStorage();
  await page.reload();

  let title = await page.title();
  expect(title).toEqual("Vue.js • TodoMVC");
  expect(title).toMatch(/TodoMVC/);
  expect(title).not.toMatch(/TodoMVCnoMatch/);

  // get html source
  expect(await page.content()).toMatch(/\<title\>Vue\.js • TodoMVC\<\/title\>/);

  let h1raw = await page.findElementWithTag("h1");
  let h1 = new PupElement(page, h1raw);
  expect(await h1.innerHTML()).toEqual("todos");

  let els = await page.findElementsWithTag("a");
  let htmlList = await Promise.all(els.map(async (el) => {
    return await (new PupElement(page, el)).innerHTML();
    //return await el.innerHTML();
  }));

  expect(htmlList).toContain("API Reference");
  expect(htmlList).not.toContain("Dashshund");

  let todoPage = new Todo(page);
  await todoPage.enterTodoItem("Hello");
  await todoPage.enterTodoItem("World");
  await todoPage.takeScreenshot();

  expect((await todoPage.todos()).length).toBe(2);


  let todoItems = await todoPage.todoItems();
  expect(await todoItems[0].innerText()).toEqual("Hello");
  expect(await todoItems[1].innerText()).toEqual("World");
  expect(todoItems.length).toBeGreaterThan(1);
  expect(todoItems.length).toBe(2);
  expect(todoItems.length).toBeLessThan(3);

  await todoItems[0].markAsComplete();
  expect(await todoItems[0].isComplete()).toBeTruthy();
  expect(await todoItems[1].isComplete()).toBeFalsy();
  await todoItems[0].takeScreenshot();

  await todoItems[1].markAsComplete();
  expect(await todoItems[1].isComplete()).toBeTruthy();
  await page.takeScreenshot();

  await (await todoPage.todoItems())[0].remove();
  expect((await todoPage.todos()).length).toBe(1);

  await (await todoPage.todoItems())[0].remove();
  expect((await todoPage.todos()).length).toBe(0);
  await page.takeScreenshot();

  // return all cookies
  let cookies = await todoPage.cookies("http://todomvc.com/");
  expect(cookies.length).toBe(3);
  cookies.forEach((cookie) => {
    let keys = Object.keys(cookie);
    expect(keys).toContain("name");
    expect(keys).toContain("value");
    expect(keys).toContain("domain");
    expect(keys).toContain("path");
    expect(keys).toContain("expires");
    expect(keys).toContain("size");
    expect(keys).toContain("httpOnly");
    expect(keys).toContain("secure");
    expect(keys).toContain("session");

    // use a custom matcher
    expect(cookie).toBeCookie();
  });

  cookies = await todoPage.cookies();
  expect(cookies.length).toBe(3);

  cookies = await todoPage.cookies("http://google.com/");
  expect(cookies.length).toBe(0);

  expect((await todoPage.todos()).length).toBe(0);
  //expect(await todoPage.todoCountElement()).toBeNull();

  // Add Two Items
  await todoPage.enterTodoItem("Orange Juice");
  await todoPage.enterTodoItem("Coffee Beans");
  expect((await todoPage.todos()).length).toBe(2);

  expect(await todoPage.todoCountElement()).not.toBeNull();
  expect(await todoPage.todoCountText()).toEqual("2 items left");

  // refresh page and verify items are still being displayed
  await todoPage.reload();
  expect((await todoPage.todos()).length).toBe(2);

  // remove todo item and reload
  await (await todoPage.todoItems())[0].remove();
  expect((await todoPage.todos()).length).toBe(1);
  expect(await todoPage.todoCountText()).toEqual("1 item left");

  await todoPage.reload();
  expect((await todoPage.todos()).length).toBe(1);
  expect(await todoPage.todoCountText()).toEqual("1 item left");

  let isVisible = await (await todoPage.todoCountElement()).isVisible();
  expect(isVisible).toBeTruthy();

  await (await todoPage.todoItems())[0].remove();
  expect((await todoPage.todos()).length).toBe(0);

  isVisible = await (await todoPage.todoCountElement()).isVisible();
  expect(isVisible).toBeFalsy();

  await todoPage.reload();
  expect((await todoPage.todos()).length).toBe(0);

  done();
});

});
