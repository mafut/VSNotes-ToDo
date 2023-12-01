const validCase = {
	path: "/home/user/notes/Project/Plan.md",
	taskOngoing: "- [ ] Task",
	taskCompleted: "- [x] Task (Completed)",
	taskOngoingWithPreview: "- [ ] Prefix: Task",
	taskCompletedWithPreview: "- [x] Prefix: Task (Completed)",
	groupFlat: "root",
	groupFile: "Plan",
	groupFolder: "Project",
	groupOverride: "Prefix",
	groupFileSub: "Plan-Prefix",
	groupFolderSub: "Project-Prefix",
	taskName: "Task"
}

module.exports = {
	validCase
};
