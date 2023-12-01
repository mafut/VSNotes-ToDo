const assert = require('assert');
const vscode = require('vscode');
const getTasks = require('../../src/getTasks');
const testData = require('./test-data');

suite('No Completed Tasks', () => {
	vscode.window.showInformationMessage('Start tests for Flat.');

	test('task node when completed=false, group=flat, prefix=ignore', () => {
		let config = {
			completed: false,
			groupBy: getTasks.groupByFlat,
			prefix: getTasks.prefixIgnore
		};

		assert.strictEqual(
			null,
			getTasks.getTaskNode(testData.path, testData.validCase.taskCompleted.match(getTasks.patternTask), config));

		assert.strictEqual(
			null,
			getTasks.getTaskNode(testData.path, testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask), config));
	});

	test('task node when completed=false, group=file, prefix=ignore', () => {
		let config = {
			completed: false,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixIgnore
		};

		assert.strictEqual(
			null,
			getTasks.getTaskNode(testData.path, testData.validCase.taskCompleted.match(getTasks.patternTask), config));

		assert.strictEqual(
			null,
			getTasks.getTaskNode(testData.path, testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask), config));
	});

	test('task node when completed=false, group=folder, prefix=ignore', () => {
		let config = {
			completed: false,
			groupBy: getTasks.groupByFolder,
			prefix: getTasks.prefixIgnore
		};

		assert.strictEqual(
			null,
			getTasks.getTaskNode(testData.path, testData.validCase.taskCompleted.match(getTasks.patternTask), config));

		assert.strictEqual(
			null,
			getTasks.getTaskNode(testData.path, testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask), config));
	});

});
