# VS NOTES + TODO

Forked from <https://github.com/patleeman/VSNotes> 0.8.0 and added ToDo tracking.

"VS Notes + ToDo" is extended version of VS Notes. Original VS Notes is a simple tool that takes care of the creation and management of plain text notes and harnesses the power of VS Code via the Command Palette. The extended feature is for task tracking and seamlessly can check tasks across notes.

<!-- TOC tocDepth:2..3 chapterDepth:2..6 -->

- [Repository](#repository)
- [Features](#features)
    - [Screenshot](#screenshot)
    - [Inheritated from original VS Notes](#inheritated-from-original-vs-notes)
    - [Added as new](#added-as-new)
    - [Tasks](#tasks)
- [Settings](#settings)
- [Roadmap & Features](#roadmap-features)
- [Change log](#change-log)
- [Contributing](#contributing)
- [Reviews](#reviews)

<!-- /TOC -->

## Repository

VS Notes + ToDo is MIT Licensed and available on [Github](https://github.com/mafut/VSNotes-ToDo)

## Features

### Screenshot

![](https://github.com/mafut/VSNotes-ToDo/raw/master/img/vsnotes_view.png)

### Inheritated from original VS Notes

1. Access commands quickly from the VS Code command palette `Ctrl/Cmd + Shift + p`.
2. Set a base folder for your notes and all notes created will be saved in that folder.
3. Easily access latest notes with `Open Note` command.
4. Retrieve notes via tags in YAML encoded frontmatter on your notes.
5. Open your note folder in a new window.
6. View your notes and tags in your filebar.
7. Automatically insert a VS Code snippet upon creation of a new note.
8. Commit and push to your upstream repository with a single command.
9. Create a note in a currently open workspace.

### Added as new

1. Retrieve uncompleted tasks ("- [ ] as format") on your notes.
2. View your tasks in your filebar and Jump to each task
3. Support to add/delete a note from explorer view or context menu.

### Tasks

Tasks are scanned across notes and they are grouped by the following 2 settings.

- Group By (taskGroupBy)
  - Flat
  - Per file
  - Per folder
- Prefix (taskPrefix)
  - Ignore
  - Override
  - Sub

 Folder | File Name | Sample Task | taskGroupBy | taskPrefix | **Grouping**
--------|-----------|-------------|-------------|------------|--------------
 Project | Plan.md | - [ ] ToDo1 | Flat | any | **Flat**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Flat | Ignore | **Flat**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Flat | Override | **Prefix**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Flat | Sub | **Prefix**
 Project | Plan.md | - [ ] ToDo1 | Per File | any | **Plan**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Per File | Ignore | **Plan**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Per File | Override | **Prefix**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Per File | Sub | **Plan-Prefix**
 Project | Plan.md | - [ ] ToDo1 | Per Folder | any | **Project**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Per Folder | Ignore | **Project**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Per Folder | Override | **Prefix**
 Project | Plan.md | - [ ] Prefix: ToDo1 | Per Folder | Sub | **Project-Sub**

## Settings

Available settings

```
// List of additional note title tokens to choose from. If supplied, a picker will be shown when creating a new note.
"vsnotes.additionalNoteTitles": [],

// The default commit message used if none is provided with the Commit and Push command.
"vsnotes.commitPushDefaultCommitMessage": "VS Notes Commit and Push",

// Shell command to execute in the note directory when the Commit and Push command is executed. The {msg} token will be replaced with the contents of an input box shown or, if empty, the default commit message.
"vsnotes.commitPushShellCommand": "git add -A && git commit -m \"{msg}\" && git push",

// Default title for new notes.
"vsnotes.defaultNoteName": "New_Note",

// Path to directory to save notes. Use ~/ to denote a relative path from home folder.
"vsnotes.defaultNotePath": "",

// Default note title. Utilizes tokens set in vsnotes.tokens.
"vsnotes.defaultNoteTitle": "{title}.{ext}",

// Default vscode snippet to execute after creating a note. Set both langId and name to null to disable.
"vsnotes.defaultSnippet": {
    "langId": "markdown",
    "name": "vsnote_template_default"
},

// Regular expressions for file names to ignore when parsing documents in note folder.
"vsnotes.ignorePatterns": [
    "^\\."
],

// Number of recent files to show when running command `List Notes`.
"vsnotes.listRecentLimit": 15,

// Automatically convert blank spaces in title to character. To disable set to `null`.
"vsnotes.noteTitleConvertSpaces": "_",

// A list of markdown templates to choose from when creating a new note.
"vsnotes.templates": [],

// Tokens used to replace text in file name.
"vsnotes.tokens": [
    {
        "type": "datetime",
        "token": "{dt}",
        "format": "YYYY-MM-DD_HH-mm",
        "description": "Insert formatted datetime."
    },
    {
        "type": "title",
        "token": "{title}",
        "description": "Insert note title from input box.",
        "format": "Untitled"
    },
    {
        "type": "extension",
        "token": "{ext}",
        "description": "Insert file vsnotes.",
        "format": "md"
    }
],

// Hide the files section in the sidebar. Requires application restart.
"vsnotes.treeviewHideFiles": false,

// Hide the tags section in the sidebar. Requires application restart.
"vsnotes.treeviewHideTags": false,

// Hide the tasks section in the sidebar. Requires application restart.
"vsnotes.treeviewHideTasks": false,

// Show even completed tasks. Requires application restart.
"vsnotes.taskIncludeCompleted": false,

// Setting how task is group by
"vsnotes.taskGroupBy": "flat",

// Setting how prefix of task is handled
"vsnotes.taskPrefix": "ignore"

```

## Roadmap & Features

[See Github Issues](https://github.com/mafut/VSNotes-ToDo/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

## Change log

[See CHANGELOG.md](./CHANGELOG.md)

## Contributing

[See CONTRIBUTING.md](./CONTRIBUTING.md)

## Reviews

[Do you like VS Notes+ToDo? Leave a review.](https://marketplace.visualstudio.com/items?itemName=mafut.vsnotes-todo#review-details)
