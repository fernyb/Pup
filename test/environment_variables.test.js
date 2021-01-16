describe("npm run test:env", () => {
  test("USE_CHROME=true", () => {
    expect(process.env.USE_CHROME).toEqual("true");
  });
});
