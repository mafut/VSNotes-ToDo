const vscode = require('vscode');
const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');
const {resolveHome} = require('./utils');

module.exports = function () {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const noteFolder = resolveHome(config.get('defaultNotePath'));

  const noteFolderLen = noteFolder.length;


  createCheckboxIndex(noteFolder).then(checkboxes => {
    vscode.window.showQuickPick(Object.keys(checkboxes)).then(checkbox => {
      if (checkbox != null) {

        const shortPaths = checkboxes[checkbox].map(function (item) {
          return item.slice(noteFolderLen + 1, item.length);
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

// Given a folder path, traverse and find all markdown files.
// Open and grab all checkbox lines.
function createCheckboxIndex(noteFolderPath) {
  const config = vscode.workspace.getConfiguration('vsnotes');
  const ignorePattern = new RegExp(config.get('ignorePatterns')
    .map(function (pattern) { return '(' + pattern + ')' })
    .join('|'));

  return new Promise((resolve, reject) => {
    let files = [];

    klaw(noteFolderPath)
      .on('data', item => {
        files.push(new Promise((res, rej) => {
          const fileName = path.basename(item.path);
          if (!item.stats.isDirectory() && !ignorePattern.test(fileName)) {
            fs.readFile(item.path).then(contents => {
              res({ path: item.path, contents: contents});
            }).catch(err => {
              console.log(err);
              res(); // resolve undefined
            })
          } else {
            res(); // resolve undefined
          }
        }))
      })
      .on('error', (err, item) => {
        reject(err)
        console.error('Error while walking notes folder for checkboxes: ', item, err);
      })
      .on('end', () => {
        Promise.all(files).then(files => {
          let checkboxIndex = {};
          for (let i = 0; i < files.length; i++) {
            if (files[i] != null && files[i]) {


            }
          }
          resolve(checkboxIndex);
        }).catch(err => {
          console.error(err)
        })
      })
  })
}