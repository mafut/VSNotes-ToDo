const vscode = require("vscode");
const path = require("path");
const { getNotes } = require("./getNotes");
const { getTags } = require("./getTags");
const { getTasks } = require("./getTasks");
const { resolveHome } = require("./utils");

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

  goto(node) {
    if (node.path === undefined) return;
    vscode.workspace.openTextDocument(node.path).then(document => {
      vscode.window.showTextDocument(document).then(editor => {
        let pos = new vscode.Position(node.line, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos));
      }
      );
    });
  }

  getChildren(node) {
    if (node) {
      switch (node.type) {
        case "rootTag":
          return Promise.resolve(getTags(this.baseDir));
        case "rootTask":
          return Promise.resolve(getTasks(this.baseDir));
        case "rootFile":
          return Promise.resolve(getNotes(this.baseDir));
        case "tag":
          return node.files;
        case "taskGroup":
          if (node.tasks.length > 0) return node.tasks;
          return null;
        case "task":
          return null;
        case "file":
          return Promise.resolve(getNotes(node.path));
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
        let rootTagTreeItem = new vscode.TreeItem("Tags", vscode.TreeItemCollapsibleState.Expanded);
        rootTagTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", "tag.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", "tag.svg"),
        };
        return rootTagTreeItem;
      case "rootTask":
        let rootTaskTreeItem = new vscode.TreeItem("Tasks", vscode.TreeItemCollapsibleState.Expanded);
        rootTaskTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", "tasks.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", "tasks.svg"),
        };
        return rootTaskTreeItem;
      case "rootFile":
        let rootFileTreeItem = new vscode.TreeItem("Files", vscode.TreeItemCollapsibleState.Expanded);
        rootFileTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", "file-directory.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", "file-directory.svg"),
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
      case "taskGroup":
        let taskGroupTreeItem = new vscode.TreeItem(
          node.group,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        taskGroupTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", "group.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", "group.svg"),
        };
        return taskGroupTreeItem;
      case "task":
        let taskTreeItem = new vscode.TreeItem(
          node.task,
          vscode.TreeItemCollapsibleState.None
        );

        taskTreeItem.command = {
          command: "vsnotes.gotoTask",
          title: "",
          arguments: [node]
        };

        let icon = node.state ? "completed.svg" : "task.svg";
        taskTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", icon),
          dark: path.join(__filename, "..", "..", "media", "dark", icon),
        };
        return taskTreeItem;
      case "file":
        const isDir = node.stats.isDirectory();
        const state = isDir
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None;
        let fileTreeItem = new vscode.TreeItem(node.file, state);
        fileTreeItem.iconPath = {
          light: path.join(__filename, "..", "..", "media", "light", isDir ? "file-directory.svg" : "file.svg"),
          dark: path.join(__filename, "..", "..", "media", "dark", isDir ? "file-directory.svg" : "file.svg"),
        };
        if (!isDir) {
          fileTreeItem.command = {
            command: "vscode.open",
            title: "",
            arguments: [vscode.Uri.file(node.path)],
          };
        }
        return fileTreeItem;
    }
  }
}

module.exports = VSNotesTreeView;
