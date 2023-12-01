const vscode = require('vscode');
const path = require('path');
const { getTags } = require('./getTags');
const { resolveHome } = require('./utils');

module.exports = () => {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = resolveHome(config.get('defaultNotePath'));
  const noteFolderLen = noteFolder.length;

  getTags(noteFolder, true).then(files => {
    vscode.window.showQuickPick(Object.keys(files)).then(tag => {
      if (tag != null) {

        let shortPaths = files[tag].map(function (item) {
          return item.path.slice(noteFolderLen + 1, item.path.length);
        })

        vscode.window.showQuickPick(shortPaths).then(chosenShortPath => {
          if (chosenShortPath != null && chosenShortPath) {
            const fullpath = path.join(noteFolder, chosenShortPath)

            vscode.window.showTextDocument(vscode.Uri.file(fullpath)).then(file => {
              console.log('Opening file ' + fullpath);
            }, err => {
              console.error(err);
            })
          }
        }, err => {
          console.error(err)
        })
      }
    }, err => {
      console.error(err)
    })
  })
}
