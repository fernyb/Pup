const {
  PupPageBase,
  PupElement
} = require("../lib/index.js");

const PostPage = require("./post.js");

class NewPostPage extends PupPageBase {
  constructor(pup) {
    super(pup);
  }

  get rootQuery() {
    return "body";
  }

  async imageChooseFileInput() {
    let els = await this.findAndWaitForElements("input[id=post_image]");
    return new PupElement(this, els[0]);
  }

  async submitBtn() {
    let els = await this.findAndWaitForElements("input[type=submit]");
    return new PupElement(this, els[0]);
  }

  async clickSubmitBtn() {
    await (await this.submitBtn()).click();
    await this.waitForNavigation();
    return new PostPage(this.pup);
  }
}

module.exports = NewPostPage;
