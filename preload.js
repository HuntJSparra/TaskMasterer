const { contextBridge, ipcRenderer } = require('electron')

// Expose "middleware" APIs
contextBridge.exposeInMainWorld(
	"api", {
		save: (tasksData) => saveTasksDataFile(tasksData),
		saveAs: (tasksData) => saveAsTasksDataFile(tasksData),
		load: () => loadTasksDataFile()
	}
);
contextBridge.exposeInMainWorld(
	"callbackRegistration", {
		newFile: (callback) => ipcRenderer.on('newFile', callback),
		load: (callback) => ipcRenderer.on('loadTasksData', (event, data) => callback(data)),
		save: (callback) => ipcRenderer.on('saveTasksData', (event, data) => callback()),
		saveAs: (callback) => ipcRenderer.on('saveAsTasksData', (event, data) => callback())
	}
);

// Messaging
function saveTasksDataFile(tasksData) {
	ipcRenderer.send('saveTasksData', tasksData)
}

function saveAsTasksDataFile(tasksData) {
	ipcRenderer.send('saveAsTasksData', tasksData)
}

function loadTasksDataFile() {
	return ipcRenderer.invoke('loadTasksData')
}