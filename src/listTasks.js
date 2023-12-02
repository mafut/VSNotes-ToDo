const vscode = require('vscode');
const path = require('path');
const { getTasks } = require('./getTasks');
const { resolveHome } = require('./utils');

module.exports = function () {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = resolveHome(config.get('defaultNotePath'));
  const noteFolderLen = noteFolder.length;

  getTasks(noteFolder).then(tasks => {
    vscode.window.showQuickPick(Object.keys(tasks)).then(task => {
      if (task != null) {

        let shortPaths = tasks[task].map(function (item) {
          return item.slice(noteFolderLen + 1, item.length);
        });

        vscode.window.showQuickPick(shortPaths).then(chosenShortPath => {
          if (chosenShortPath != null && chosenShortPath) {
            const fullpath = path.join(noteFolder, chosenShortPath);

            vscode.window.showTextDocument(vscode.Uri.file(fullpath)).then(file => {
              console.log('Opening file ' + fullpath);
            }, err => {
              console.error(err);
            });
          }
        }, err => {
          console.error(err);
        });
      }
    }, err => {
      console.error(err);
    });
  });
}
