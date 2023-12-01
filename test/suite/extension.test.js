const assert = require('assert');
const vscode = require('vscode');
const getTasks = require('../../src/getTasks');
const testData = require('./test-data');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start "regular expression" tests.');

	test('task regular expression', () => {
		let match = null;

		match = testData.validCase.taskOngoing.match(getTasks.patternTask);
		assert.notEqual(match, null);
		assert.strictEqual(match.length, 3);

		match = testData.validCase.taskCompleted.match(getTasks.patternTask);
		assert.notEqual(match, null);
		assert.strictEqual(match.length, 3);

		match = testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask);
		assert.notEqual(match, null);
		assert.strictEqual(match.length, 3);

		match = testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask);
		assert.notEqual(match, null);
		assert.strictEqual(match.length, 3);
	});
});
