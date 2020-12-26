#!/usr/bin/env node

const program = require("commander");
program.version("0.1.0");

const test = require("./todomvc-example.js");

const options = {
  featureName: null
};


program.
  option("-f, --feature <feature>", "Feature to run").
  action(function(task) {
    options['featureName'] = task.feature;
  });

program.parse(process.argv);

if(options['featureName'] == "test") {
  test();
}
