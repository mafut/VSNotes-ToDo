// https://code.visualstudio.com/api/working-with-extensions/testing-extension
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([
    {
        label: 'unitTests',
        files: 'out/test/**/*.test.js',
        //version: 'insiders',
        //workspaceFolder: './sampleWorkspace',
        mocha: {
            ui: 'tdd',
            timeout: 20000
        }
    }
]);
