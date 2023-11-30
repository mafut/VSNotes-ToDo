const vscode = require('vscode');
const path = require('path');
const fs = require('fs-extra');

// Given a folder path, traverse and find all markdown files.
// Open and grab tags from front matter.
function getNotes(noteFolderPath) {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const ignorePattern = new RegExp(config.get('ignorePatterns')
    .map(function (pattern) { return '(' + pattern + ')' })
    .join('|'));

  return new Promise((resolve, reject) => {
    fs.readdir(noteFolderPath)
      .then((files) => {
        let items = [];
        files.forEach((file) => {
          if (!ignorePattern.test(file)) {
            items.push({
              type: "file",
              file: file,
              path: path.join(noteFolderPath, file),
              stats: fs.statSync(path.join(noteFolderPath, file)),
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

module.exports = {
  getNotes
}

