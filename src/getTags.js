const vscode = require('vscode');
const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');
const matter = require('gray-matter');

// Given a folder path, traverse and find all markdown files.
// Open and grab tags from front matter.
function getTags(noteFolderPath, isFileList = false) {
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
              res({
                path: item.path,
                contents: contents,
                payload: {
                  type: "file",
                  filename: fileName,
                  path: item.path,
                  stats: item.stats,
                }
              });
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
        console.error('Error while walking notes folder for tags: ', item, err);
      })
      .on('end', () => {
        Promise.all(files).then(files => {
          // file list by tag
          let fileByTag = {};

          for (let i = 0; i < files.length; i++) {
            if (files[i] != null && files[i]) {
              const parsedFrontMatter = parseFrontMatter(files[i]);
              if (parsedFrontMatter && 'tags' in parsedFrontMatter.data && parsedFrontMatter.data.tags) {
                for (let tag of parsedFrontMatter.data.tags) {
                  if (tag in fileByTag) {
                    fileByTag[tag].push(files[i].payload);
                  } else {
                    fileByTag[tag] = [files[i].payload];
                  }
                }
              }
            }
          }

          // return if return if needed filelist by tag
          if (isFileList) resolve(fileByTag);

          // tag list with files
          let tags = [];
          for (let tag of Object.keys(fileByTag)) {
            tags.push({
              type: "tag",
              tag: tag,
              files: fileByTag[tag],
            });
          }

          // Sort tags alphabetically
          tags.sort(function (a, b) {
            return a.tag > b.tag ? 1 : b.tag > a.tag ? -1 : 0;
          });

          resolve(tags);
        }).catch(err => {
          console.error(err)
        })
      })
  })
}

function parseFrontMatter(file) {
  try {
    const parsedFrontMatter = matter(file.contents)
    if (!(parsedFrontMatter.data instanceof Object)) {
      console.error('YAML front-matter is not an object: ', file.path);
      return null;
    }
    return parsedFrontMatter;
  } catch (e) {
    console.error(file.path, e);
    return null;
  }
}

module.exports = {
  getTags
}

