const P = require("../lib/index.js");

class TodoItem extends P.PupElement {
  constructor(element) {
    super(element);
  }

  async checkbox() {
    return await this.element.$("input[type=checkbox]");
  }

  async destroyButton() {
    return await this.element.$("button.destroy");
  }

  async markAsComplete() {
    let el = await this.checkbox();
    await el.click();
  }

  async remove() {
    await this.hover();
    let el = await this.destroyButton();
    await el.hover();
    await el.click();
  }
}

class Todo extends P.PupPage {
  constructor(pup) {
    super(pup);
  }

  async textfield() {
      return await this.findBySelector("input.new-todo");
  }

  async enterTodoItem(name) {
    let textfield = await this.textfield();
    await textfield.click();
    await textfield.type(name);
    await textfield.pressEnter();
  }

  async todos() {
    return await this.findElements(".todo-list .todo");
  }

  async todoItems() {
    return (await this.todos()).map(el => new TodoItem(el));
  }
}

module.exports = Todo;
