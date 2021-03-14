const {
  Pup,
  PupPageBase,
  PupElement
} = require("../lib/index.js");

class TodoCountElement extends PupElement {
  constructor(pup, element) {
    super(pup, element);
  }
}

class TodoItem extends PupElement {
  constructor(pup, element) {
    super(pup, element);
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

  async isComplete() {
    return (await this.getClassNames()).includes("completed");
  }

  async remove() {
    await this.hover();
    let el = await this.destroyButton();
    await el.hover();
    await el.click();
  }
}

class Todo extends PupPageBase {
  constructor(pup) {
    super(pup);
  }

  async todoCountElement() {
    let todoCount = (await this.findElements(".todo-count"))[0];
    if (todoCount) {
      return (new TodoCountElement(this, todoCount));
    } else {
      return null;
    }
  }

  async todoCountText() {
    return await (await this.todoCountElement()).innerText();
  }

  async textfield() {
    return this.findBySelector("input.new-todo").then((el) => {
      return new PupElement(this, el);
    });
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
    return (await this.todos()).map(el => new TodoItem(this, el));
  }
}

module.exports = Todo;
