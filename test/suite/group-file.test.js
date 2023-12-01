const assert = require('assert');
const vscode = require('vscode');
const getTasks = require('../../src/getTasks');
const testData = require('./test-data');

suite('Group By File', () => {
	vscode.window.showInformationMessage('Start tests for File.');

	// ongoing tasks when completed=false
	test('task node when completed=false, group=file, prefix=ignore', () => {
		let config = {
			completed: false,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixIgnore
		};

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoing.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).group);
	});

	test('task node when completed=false, group=file, prefix=override', () => {
		let config = {
			completed: false,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixOverride
		};

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoing.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupOverride,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.taskName,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).task,
			"Prefix should remove from task name");
	});

	test('task node when completed=false, group=file, prefix=sub', () => {
		let config = {
			completed: false,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixSub
		};

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoing.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFileSub,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.taskName,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).task,
			"Prefix should remove from task name");
	});

	// completed=true
	test('task node when completed=true, group=file, prefix=ignore', () => {
		let config = {
			completed: true,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixIgnore
		};

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoing.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskCompleted.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask), config).group);
	});


	test('task node when completed=true, group=file, prefix=override', () => {
		let config = {
			completed: true,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixOverride
		};

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoing.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskCompleted.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupOverride,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupOverride,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask), config).group);
	});

	test('task node when completed=true, group=file, prefix=ignore', () => {
		let config = {
			completed: true,
			groupBy: getTasks.groupByFile,
			prefix: getTasks.prefixSub
		};

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoing.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFile,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskCompleted.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFileSub,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskOngoingWithPreview.match(getTasks.patternTask), config).group);

		assert.strictEqual(
			testData.validCase.groupFileSub,
			getTasks.getTaskNode(testData.validCase.path, testData.validCase.taskCompletedWithPreview.match(getTasks.patternTask), config).group);
	});
});
