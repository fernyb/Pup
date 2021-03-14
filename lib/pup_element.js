const PupPageBase = require("./pup_page_base.js");

class PupElement extends PupPageBase {
  constructor(pup, element) {
    super(pup);
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
    return await (await this.pup.page()).evaluate((e) => {
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
    let newPage = opts['newPage'] ? true : false;
    delete opts['newPage'];
    await this.element.click(opts);
    if (newPage) {
      await this.wait(500);
    }
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

  // https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-class-mouse
  async mouseDown() {
    let point = await this.centerPoint();
    let _page = await this.pup.page();
    await _page.mouse.move(point.x, point.y);
    return await _page.mouse.down();
  }

  async mouseMove(x, y) {
    await (await this.pup.page()).mouse.move(x, y, { steps: 10 });
    await this.pup.wait(1);
  }

  async mouseUp() {
    return await (await this.pup.page()).mouse.up();
  }

  async centerPoint() {
    const boundingBox = await this.element.boundingBox();
    return {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2
    };
  }

  async tap(point=null) {
    const atPoint = point ? point : (await this.centerPoint());
    return await (
      await this.pup.page()
    ).touchscreen.tap(atPoint.x, atPoint.y);
  }
}

module.exports = PupElement;
