const { ipcRenderer } = require('electron')
// const { dialog } = require('electron').remote

const td = require('./tasksData.js')

td.loadTasksDataDOM(td.createDefaultTasksDataDOM())

// File I/O
function saveTasksDataFile() {
	ipcRenderer.sendSync('synchronous-message', { type: 'saveTasksData', data: td.domToTasksData()})
}

function loadTasksDataFile() {
	let tasksData = ipcRenderer.sendSync('synchronous-message', { type: 'loadTasksData' })
	if (tasksData === undefined) {
		return // Event cancelled or errored
	}
	let tasksDataDiv = td.createTasksDataDOM(tasksData)
	td.loadTasksDataDOM(tasksDataDiv)
}