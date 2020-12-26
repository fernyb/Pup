const Pup = require("./lib/index.js").Pup;
const Todo = require("./pages/todo.js");

const test = (async function() {
  let p = new Pup();
  let page = await p.newPage("http://todomvc.com/examples/vue/#/all");

  await p.waitForTitle();

  let title = await page.title();
  console.log("----------------------");
  console.log(`The title is: ${title}`);

  let h1 = await page.findElementWithTag("h1")
  console.log("h1: "+ await h1.innerHTML());
  console.log("---");

  let els = await page.findElementsWithTag("a")
  for(var i=0; i<els.length; i++) {
    console.log("a: "+ await els[i].innerHTML());
    console.log("---");
  }
  await page.waitFor();

  let todoPage = new Todo(p);
  await todoPage.enterTodoItem("Hello");
  await todoPage.enterTodoItem("World");

  let todos = await todoPage.todos();
  console.log("Number of todos: "+ todos.length);

  let todoItems = await todoPage.todoItems();
  await todoItems[0].markAsComplete();
  await todoItems[1].markAsComplete();

  await (await todoPage.todoItems())[0].remove();
  await (await todoPage.todoItems())[0].remove();

  await page.waitFor();

  await p.close();
  console.log("----------------------");
});

module.exports = test;
