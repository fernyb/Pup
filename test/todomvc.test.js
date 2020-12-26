const Pup = require("../lib/index.js").Pup;
const Todo = require("../pages/todo.js");


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

  let title = await page.title();
  expect(title).toEqual("Vue.js • TodoMVC");
  expect(title).toMatch(/TodoMVC/);
  expect(title).not.toMatch(/TodoMVCnoMatch/);

  let h1 = await page.findElementWithTag("h1");
  expect(await h1.innerHTML()).toEqual("todos");

  let els = await page.findElementsWithTag("a");
  let htmlList = await Promise.all(els.map(async (el) => {
    return await el.innerHTML();
  }));

  expect(htmlList).toContain("API Reference");
  expect(htmlList).not.toContain("Dashshund");

  let todoPage = new Todo(p);
  await todoPage.enterTodoItem("Hello");
  await todoPage.enterTodoItem("World");
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

  done();
});

});
