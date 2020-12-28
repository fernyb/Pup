expect.extend({
  toBeCookie(expected) {
    if (expected === null) {
      return {
        pass: false,
        message: () => 'Cookie expected to be not null.'
      };
    }
    let keys = Object.keys(expected);

    if (this.isNot) {
      expect(keys).not.toContain("name");
      expect(keys).not.toContain("value");
      expect(keys).not.toContain("domain");
      expect(keys).not.toContain("path");
      expect(keys).not.toContain("expires");
      expect(keys).not.toContain("size");
      expect(keys).not.toContain("httpOnly");
      expect(keys).not.toContain("secure");
      expect(keys).not.toContain("session");
    } else {
      expect(keys).toContain("name");
      expect(keys).toContain("value");
      expect(keys).toContain("domain");
      expect(keys).toContain("path");
      expect(keys).toContain("expires");
      expect(keys).toContain("size");
      expect(keys).toContain("httpOnly");
      expect(keys).toContain("secure");
      expect(keys).toContain("session");
    }

    return { pass: !this.isNot };
  }
});

