const PupBase = require("./pup_base.js");

class PupElement extends PupBase {
  constructor(pup, element) {
    super();
    this.pup = pup;
    this._element = element;
  }

  get element() {
    return this._element;
  }

  async boxModel() {
    return await this.element.boxModel();
  }

  async getStyle() {
    return await this.pup.page.evaluate((e) => {
      let style = window.getComputedStyle(e);
      let keys = Object.values(style);
      let computedStyles = {};
      for(let i=0; i < keys.length; i++) {
        let k = keys[i];
        computedStyles[k] = style[k];
      }
      return computedStyles;
    }, this.element);
  }

  async isVisible() {
    const style = await this.getStyle();
    const isVisibleFunc = (style) => {
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      );
    };

    const box = await this.boxModel();
    const isVisibleInViewport = await this.element.isIntersectingViewport();

    return (isVisibleFunc(style) && box && isVisibleInViewport);
  }

  async isHidden() {
    return !this.isVisible();
  }

  async getProperty(name) {
    return await eval(`this.element.evaluate(el => el.${name}, "*")`);
  }

  async getClassNames() {
    let classList = (await this.getProperty("className")).split(" ");
    let classes = [];
    for(var i=0; i<classList.length; i++) {
      classes.push(classList[i]);
    }
    return classes;
  }

  async tagName() {
    return await this.getProperty("tagName");
  }

  async innerHTML() {
    return await this.getProperty("innerHTML");
  }

  async innerText() {
    return await this.getProperty("innerText");
  }

  async hover() {
    await this.element.hover();
  }

  async click(opts={}) {
    await this.element.click(opts);
  }

  async rightClick() {
    await this.click({ button: "right" });
  }

  async type(str) {
    await this.element.type(str);
  }

  async pressEnter() {
    await this.element.type('\r');
  }
}

module.exports = PupElement;
