window.callbackRegistration.newFile(loadNewFile)
window.callbackRegistration.load(loadTasksDataAndDisplay)
window.callbackRegistration.save(saveTasksDataFile)
window.callbackRegistration.saveAs(saveAsTasksDataFile)

// Callbacks | Messaging Wrappers for DOM
function loadNewFile() {
	loadTasksDataDOM(createDefaultTasksDataDOM())
}

async function loadTasksDataAndDisplay() {
	let tasksData = await window.api.load()
	if (tasksData === undefined) {
		return // Event cancelled or errored
	}
	let tasksDataDiv = createTasksDataDOM(tasksData)
	loadTasksDataDOM(tasksDataDiv)
}

function saveTasksDataFile() {
	let tasksData = domToTasksData()
	window.api.save(tasksData)
}

function saveAsTasksDataFile() {
	let tasksData = domToTasksData()
	window.api.saveAs(tasksData)
}