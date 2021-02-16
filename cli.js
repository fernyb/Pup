#!/usr/bin/env node

const glob = require("glob");
const fs = require("fs");
const path = require("path");
const program = require("commander");
program.version("0.1.0");

var opts = {
  print: "./test",
  generate: ".",
  featureName: null
};


program.
  option("-p, --print <directory>", "Print all test files, default: ./test").
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

const getAllTestFiles = (opt) => {
  let files = glob.sync(`${ opt['print'] }/*\.test\.js`, {});

  let group_count = 2; // number of containers
  //console.log("Number of containers: " + group_count);
  let files_count = Math.ceil(files.length / group_count) * group_count;
  let files_count_per_group = files_count / group_count;
  //console.log("Files per containers: " + files_count_per_group);

  let counter = 1;
  let groups = {};
  let group_idx = 0;
  groups[0] = [];

  for(let i=0; i<files_count; i++) {
    let file = files[i];
    if (groups[group_idx].length == files_count_per_group) {
      group_idx += 1;
      groups[group_idx] = [];
    }

    if (file) {
      groups[group_idx].push(file);
    }
  }
  console.log(`Test file count: ${ files.length }\n`);
  //console.log(groups);

  let files_line = Object.values(groups).map((x)=> x.join(" "));

  let c = 0;
  return files_line.map(f => {
    c += 1;
    return {
      name: `test_${c}`,
      file: f
    };
  });
}

const buildComposeFile = (opts) => {
  let names = getAllTestFiles(opts);
  let test_names = names.map(f => {
    return `
  ${f.name}_test:
    image: pup
    command: bash -c "/pup/run_test.sh ${f.file}"
`;
  }).join("");
  compose_str = `version: "3.9"
services:`;

  return compose_str + test_names;
}

if (opts['print']) {
  console.log("Print All Tests:");
  const composeStr = buildComposeFile(opts);
  fs.writeFileSync("./docker-compose-test.yml", composeStr);
  console.log(composeStr);
}
