const vscode = require("vscode");
const fs = require("fs-extra");
const path = require("path");
const klaw = require("klaw");
const matter = require("gray-matter");
const { resolveHome } = require("./utils");
const lineByLine = require('n-readlines');
const taskPattern = /\s*-\s+\[([xX\s]{1})\]\s+(.+)/i;

class VSNotesTreeView {
  constructor() {
    const config = vscode.workspace.getConfiguration("vsnotes");
    this.baseDir = resolveHome(config.get("defaultNotePath"));
    this.ignorePattern = new RegExp(
      config
        .get("ignorePatterns")
        .map(function (pattern) {
          return "(" + pattern + ")";
        })
        .join("|")
    );
    this.hideTags = config.get("treeviewHideTags");
    this.hideTasks = config.get("treeviewHideTasks");
    this.hideFiles = config.get("treeviewHideFiles");

    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(node) {
    if (node) {
      switch (node.type) {
        case "rootTask":
          this.tasks = Promise.resolve(this._getTasks(this.baseDir));
          return this.tasks;
        case "task":
          return node.files;
        case "rootTag":
          this.tags = Promise.resolve(this._getTags(this.baseDir));
          return this.tags;
        case "tag":
          return node.files;
        case "rootFile":
          return Promise.resolve(this._getDirectoryContents(this.baseDir));
        case "file":
          return Promise.resolve(this._getDirectoryContents(node.path));
      }
    } else {
      const treeview = [];
      if (!this.hideFiles) {
        treeview.push({
          type: "rootFile",
        });
      }
      if (!this.hideTags) {
        treeview.push({
          type: "rootTag",
        });
      }
      if (!this.hideTasks) {
        treeview.push({
          type: "rootTask",
        });
      }
      return treeview;
    }
  }

  getTreeItem(node) {
    switch (node.type) {
      case "rootTag":
        let rootTagTreeItem = new vscode.TreeItem(
          "Tags",
          vscode.TreeItemCollapsibleState.Expanded
        );
        rootTagTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", "tag.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", "tag.svg"),
        };
        return rootTagTreeItem;
      case "rootTask":
        let rootTaskTreeItem = new vscode.TreeItem(
          "Tasks",
          vscode.TreeItemCollapsibleState.Expanded
        );
        rootTaskTreeItem.iconPath = {
          light: path.join(
            __filename,
            "..",
            "..",
            "media",
            "light",
            "task.svg"
          ),
          dark: path.join(
            __filename,
            "..",
            "..",
            "media",
            "dark",
            "task.svg"
          ),
        };
        return rootTaskTreeItem;
      case "rootFile":
        let rootFileTreeItem = new vscode.TreeItem(
          "Files",
          vscode.TreeItemCollapsibleState.Expanded
        );
        rootFileTreeItem.iconPath = {
          light: path.join(
            __filename,
            "..",
            "..",
            "media",
            "light",
            "file-directory.svg"
          ),
          dark: path.join(
            __filename,
            "..",
            "..",
            "media",
            "dark",
            "file-directory.svg"
          ),
        };
        return rootFileTreeItem;
      case "tag":
        let tagTreeItem = new vscode.TreeItem(
          node.tag,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        tagTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", "tag.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", "tag.svg"),
        };
        return tagTreeItem;
      case "task":
        let taskTreeItem = new vscode.TreeItem(
          node.task,
          vscode.TreeItemCollapsibleState.None
        );
        taskTreeItem.command = {
          command: "editor.action.goToLocations",
          title: "",
          arguments: [vscode.Uri.file(node.path) + ":" + node.line],
        }
        taskTreeItem.iconPath = {
          light: path.join(
            __filename,
            "..",
            "..",
            "media",
            "light",
            "task.svg"
          ),
          dark: path.join(
            __filename,
            "..",
            "..",
            "media",
            "dark",
            "task.svg"
          ),
        };
        return taskTreeItem;
      case "file":
        const isDir = node.stats.isDirectory();
        const state = isDir
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None;
        let fileTreeItem = new vscode.TreeItem(node.file, state);
        if (isDir) {
          fileTreeItem.iconPath = {
            light: path.join(
              __filename,
              "..",
              "..",
              "media",
              "light",
              "file-directory.svg"
            ),
            dark: path.join(
              __filename,
              "..",
              "..",
              "media",
              "dark",
              "file-directory.svg"
            ),
          };
        } else {
          fileTreeItem.command = {
            command: "vscode.open",
            title: "",
            arguments: [vscode.Uri.file(node.path)],
          };
          fileTreeItem.iconPath = {
            light: path.join(
              __filename,
              "..",
              "..",
              "media",
              "light",
              "file.svg"
            ),
            dark: path.join(
              __filename,
              "..",
              "..",
              "media",
              "dark",
              "file.svg"
            ),
          };
        }
        return fileTreeItem;
    }
  }

  // Given a filepath, return an array of TreeItems
  _getDirectoryContents(filePath) {
    return new Promise((resolve, reject) => {
      fs.readdir(filePath)
        .then((files) => {
          let items = [];
          files.forEach((file) => {
            if (!this.ignorePattern.test(file)) {
              items.push({
                type: "file",
                file: file,
                path: path.join(filePath, file),
                stats: fs.statSync(path.join(filePath, file)),
              });
            }
          });
          resolve(items);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  _getTags() {
    return new Promise((resolve, reject) => {
      let files = [];

      klaw(this.baseDir)
        .on("data", (item) => {
          files.push(
            new Promise((res, rej) => {
              const fileName = path.basename(item.path);
              if (
                !item.stats.isDirectory() &&
                !this.ignorePattern.test(fileName)
              ) {
                fs.readFile(item.path)
                  .then((contents) => {
                    res({
                      path: item.path,
                      contents: contents,
                      payload: {
                        type: "file",
                        file: fileName,
                        path: item.path,
                        stats: item.stats,
                      },
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    res();
                  });
              } else {
                res();
              }
            })
          );
        })
        .on("error", (err, item) => {
          reject(err);
          console.error(
            "Error while walking notes folder for tags: ",
            item,
            err
          );
        })
        .on("end", () => {
          Promise.all(files)
            .then((files) => {
              // Build a tag index first
              let tagIndex = {};
              for (let i = 0; i < files.length; i++) {
                if (files[i] != null && files[i]) {
                  const parsedFrontMatter = this._parseFrontMatter(files[i]);
                  if (
                    parsedFrontMatter &&
                    "tags" in parsedFrontMatter.data &&
                    parsedFrontMatter.data.tags
                  ) {
                    for (let tag of parsedFrontMatter.data.tags) {
                      if (tag in tagIndex) {
                        tagIndex[tag].push(files[i].payload);
                      } else {
                        tagIndex[tag] = [files[i].payload];
                      }
                    }
                  }
                }
              }
              // Then build an array of tags
              let tags = [];
              for (let tag of Object.keys(tagIndex)) {
                tags.push({
                  type: "tag",
                  tag: tag,
                  files: tagIndex[tag],
                });
              }
              // Sort tags alphabetically
              tags.sort(function (a, b) {
                return a.tag > b.tag ? 1 : b.tag > a.tag ? -1 : 0;
              });
              resolve(tags);
            })
            .catch((err) => {
              console.error(err);
            });
        });
    });
  }

  _parseFrontMatter(file) {
    try {
      const parsedFrontMatter = matter(file.contents);
      if (!(parsedFrontMatter.data instanceof Object)) {
        console.error("YAML front-matter is not an object: ", file.path);
        return null;
      }
      return parsedFrontMatter;
    } catch (e) {
      console.error(file.path, e);
      return null;
    }
  }

  _getTasks() {
    return new Promise((resolve, reject) => {
      let files = [];
      klaw(this.baseDir)
        .on("data", (item) => {
          files.push(
            new Promise((res, rej) => {
              const fileName = path.basename(item.path);
              if (
                !item.stats.isDirectory() &&
                !this.ignorePattern.test(fileName)
              ) {
                res({
                  path: item.path,
                  payload: {
                    type: "file",
                    file: fileName,
                    path: item.path,
                    stats: item.stats,
                  },
                });
              } else {
                res();
              }
            })
          );
        })
        .on("error", (err, item) => {
          reject(err);
          console.error(
            "Error while walking notes folder for Tasks: ",
            item,
            err
          );
        })
        .on("end", () => {
          Promise.all(files)
            .then((files) => {
              // Build a task index first
              let tasks = [];
              for (let i = 0; i < files.length; i++) {
                if (files[i] != null && files[i]) {
                  let liner = new lineByLine(files[i].path);
                  let line;
                  let lineNumber = 0;
                  while (line = liner.next()) {
                    let match = line.toString('utf8').match(taskPattern);
                    if (match && match != null && match.length == 3) {
                      tasks.push({
                        type: "task",
                        task: match[2],
                        path: files[i].path,
                        line: lineNumber
                      });
                    }
                    lineNumber++;
                  }
                }
              }
              // Sort tasks alphabetically
              tasks.sort(function (a, b) {
                return a.task > b.task
                  ? 1
                  : b.task > a.task
                    ? -1
                    : 0;
              });
              resolve(tasks);
            })
            .catch((err) => {
              console.error(err);
            });
        });
    });
  }
}

module.exports = VSNotesTreeView;
