const vscode = require('vscode');
const path = require('path');
const klaw = require('klaw');
const lineByLine = require('n-readlines');
const taskPattern = /\s*-\s+\[([xX\s]{1})\]\s+(.+)/i;
const prefixPattern = /(?:([^:]+):\s)*(.+)/i;
const noGroup = "No Group";

// Given a folder path, traverse and find all markdown files.
// Open and grab tags from front matter.
function getTasks(noteFolderPath) {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const ignorePattern = new RegExp(config.get('ignorePatterns')
    .map(function (pattern) { return '(' + pattern + ')' })
    .join('|'));

  const showCompleted = config.get("taskIncludeCompleted");
  const taskGroupBy = config.get("taskGroupBy");
  const taskPrefix = config.get("taskPrefix");

  return new Promise((resolve, reject) => {
    let files = [];

    klaw(noteFolderPath)
      .on("data", (item) => {
        files.push(
          new Promise((res, rej) => {
            let fileName = path.basename(item.path);
            let group = (taskGroupBy == "file")
              ? path.parse(fileName).name
              : (taskGroupBy == "folder")
                ? path.parse(path.dirname(item.path)).name
                : noGroup;

            if (!item.stats.isDirectory() && !ignorePattern.test(fileName)) {
              res({
                group: group,
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
              let group = files[i].group;

              let liner = new lineByLine(files[i].path);
              let line;
              let lineNumber = 0;
              while (line = liner.next()) {
                let match = line.toString('utf8').match(taskPattern);
                if (match && match != null && match.length == 3) {
                  let task = match[2];

                  // Completed Task
                  if (match[1].toLowerCase() === "x" && !showCompleted) {
                    lineNumber++;
                    continue;
                  }

                  // Define group
                  if (taskPrefix === "override" || taskPrefix === "sub") {
                    let matchPrefix = match[2].toString('utf8').match(prefixPattern);

                    if (matchPrefix && matchPrefix != null && matchPrefix.length == 3 && matchPrefix[1] !== undefined) {
                      if (group === undefined || group == noGroup || taskPrefix === "override") {
                        group = matchPrefix[1].trim();
                      } else {
                        group = files[i].group + "-" + matchPrefix[1].trim();
                        task = matchPrefix[2].trim();
                      }
                    }
                  }

                  let taskNode = {
                    type: "task",
                    task: task,
                    path: files[i].path,
                    line: lineNumber,
                    state: match[1].toLowerCase() === "x" ? true : false
                  };

                  // Store
                  if (group in taskByGroup) {
                    taskByGroup[group].push(taskNode);
                  } else {
                    taskByGroup[group] = [taskNode];
                  }
                }
                lineNumber++;
              }
            }
          }

          let keys = Object.keys(taskByGroup);
          if (keys.length == 1) {
            resolve(taskByGroup[noGroup]);
          } else {
            // taskGroup list with tasks
            let groups = [];
            for (let group of keys) {
              groups.push({
                type: "taskGroup",
                group: group,
                tasks: taskByGroup[group],
              });
            }

            // Sort taskGroup alphabetically by group
            groups.sort(function (a, b) {
              return a.group > b.group ? 1 : b.group > a.group ? -1 : 0;
            });

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

module.exports = {
  getTasks
}
