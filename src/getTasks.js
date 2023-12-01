const vscode = require('vscode');
const path = require('path');
const klaw = require('klaw');
const lineByLine = require('n-readlines');

const patternTask = /\s*-\s+\[([xX\s]{1})\]\s+(.+)/i;
const patternPrefix = /(?:([^:]+):\s)*(.+)/i;

const defaultGroup = "root";

const groupByFlat = "flat";
const groupByFile = "file";
const groupByFolder = "folder";

const prefixIgnore = "ignore";
const prefixOverride = "override";
const prefixSub = "sub";

// Given a folder path, traverse and find all markdown files.
// Open and grab tags from front matter.
function getTasks(noteFolderPath, isCommand = false) {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const ignorePattern = new RegExp(config.get('ignorePatterns')
    .map(function (pattern) { return '(' + pattern + ')' })
    .join('|'));

  const showCompleted = config.get("taskIncludeCompleted");
  const taskGroupBy = isCommand ? "flat" : config.get("taskGroupBy");
  const taskPrefix = isCommand ? "ignore" : config.get("taskPrefix");

  return new Promise((resolve, reject) => {
    let files = [];

    klaw(noteFolderPath)
      .on("data", (item) => {
        files.push(
          new Promise((res, rej) => {
            if (!item.stats.isDirectory() && !ignorePattern.test(path.basename(item.path))) {
              res({
                path: item.path
              });
            } else {
              res();
            }
          })
        );
      })
      .on("error", (err, item) => {
        reject(err);
        console.error("Error while walking notes folder for Tasks: ", item, err);
      })
      .on("end", () => {
        Promise.all(files).then((files) => {
          // task like by group
          let taskByGroup = {};

          for (let i = 0; i < files.length; i++) {
            if (files[i] != null && files[i]) {
              let liner = new lineByLine(files[i].path);
              let line;
              let lineNumber = 0;
              while (line = liner.next()) {
                let match = line.toString('utf8').match(patternTask);
                if (match && match != null && match.length === 3) {
                  // get task node
                  let taskNode = getTaskNode(
                    files[i].path,
                    match,
                    {
                      completed: showCompleted,
                      groupBy: taskGroupBy,
                      prefix: taskPrefix
                    }
                  );

                  if (taskNode) {
                    taskNode.lineNumber = lineNumber;
                    // Store
                    if (taskNode.group in taskByGroup) {
                      taskByGroup[taskNode.group].push(taskNode);
                    } else {
                      taskByGroup[taskNode.group] = [taskNode];
                    }
                  }
                }
                lineNumber++;
              }
            }
          }

          let keys = Object.keys(taskByGroup);
          if (keys.length == 1 && defaultGroup in taskByGroup) {
            resolve(taskByGroup[defaultGroup]);
          } else {
            // taskGroup list with tasks
            let groups = [];
            for (let group of keys) {
              if (group !== defaultGroup) {
                groups.push({
                  type: "taskGroup",
                  group: group,
                  tasks: taskByGroup[group],
                });
              }
            }

            // Sort taskGroup alphabetically by group
            groups.sort(function (a, b) {
              return a.group > b.group ? 1 : b.group > a.group ? -1 : 0;
            });

            // Finally add tasks of default group
            if (defaultGroup in taskByGroup) {
              for (let task of taskByGroup[defaultGroup]) {
                groups.push(task);
              }
            }

            resolve(groups);
          }
        })
          .catch((err) => {
            reject(err);
            console.error(err);
          });
      });
  });
}

function getTaskNode(filepath, match, taskConfig) {
  if (!match || match.length != 3) {
    return null;
  }

  // Completed Task
  if (match[1].toLowerCase() === "x" && !taskConfig.completed) {
    return null;
  }

  // Initial task name
  let task = match[2];

  // Initial group
  let group = (taskConfig.groupBy == "file")
    ? path.parse(path.basename(filepath)).name
    : (taskConfig.groupBy == "folder")
      ? path.parse(path.dirname(filepath)).name
      : defaultGroup;

  // Define group
  if (taskConfig.prefix === "override" || taskConfig.prefix === "sub") {
    let matchPrefix = match[2].toString('utf8').match(patternPrefix);

    if (matchPrefix && matchPrefix != null && matchPrefix.length == 3 && matchPrefix[1] !== undefined) {
      //0:original task name, 1:prefix, 2:task name without prefix
      if (group === undefined || group == defaultGroup || taskConfig.prefix === "override") {
        group = matchPrefix[1].trim();
        task = matchPrefix[2].trim();
      } else {
        group = group + "-" + matchPrefix[1].trim();
        task = matchPrefix[2].trim();
      }
    }
  }

  return {
    type: "task",
    task: task,
    group: group,
    path: filepath,
    line: 0,
    state: match[1].toLowerCase() === "x" ? true : false
  };
}

module.exports = {
  patternTask,
  patternPrefix,
  defaultGroup,
  groupByFlat,
  groupByFile,
  groupByFolder,
  prefixIgnore,
  prefixOverride,
  prefixSub,
  getTasks,
  getTaskNode
}
