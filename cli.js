#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
program.version("0.1.0");

var opts = {
  generate: ".",
  featureName: null
};


program.
  option("-g, --generate <directory>", "Generate new project files, default: .").
  option("-f, --feature <feature>", "Feature to run").
  action(function(task) {
    opts['generate'] = task.generate;
    opts['featureName'] = task.feature;
  });

program.parse(process.argv);

if (opts['generate']) {
  let dir = opts['generate'];
  console.log(dir);

  if (fs.existsSync(dir)) {
    console.log(`Directory exists!`);
    console.log(dir);
  } else {
    console.log("Directory not found, we should create it.");
    console.log("Generate Dir: "+ dir);
  }
}
