const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron')
const fs = require('fs') // path.resolve be used with this?
const td = require('./tasksData.js')

let renderWindow = null // Will be defined later

function createWindow () {
	renderWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			nodeIntegration: true
		}
	})

	renderWindow.loadFile('main.html')

	renderWindow.webContents.openDevTools()
}

// Menu

const menuTemplate = [
	...((process.platform === 'darwin') ? [{
		label: app.name,
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	}] : []),
	{

		label: '&File',
		submenu: [
			{
				label: 'New File',
				accelerator: 'CmdOrCtrl+N',
				click() {
					save_file_path = undefined
					renderWindow.webContents.send('asynchronous-message', { type: 'newFile' })
				}
			},
			{
				label: 'Save',
				accelerator: 'CmdOrCtrl+S',
				click() {
					renderWindow.webContents.send('asynchronous-message', { type: 'saveTasksData' })
				}
			},
			{ 
				label: 'Save As...',
				accelerator: 'CmdOrCtrl+Shift+S',
				click() {
					renderWindow.webContents.send('asynchronous-message', { type: 'saveAsTasksData' })
				}	
			},
			{
				label: 'Open...',
				accelerator: 'CmdOrCtrl+O',
				click() {
					renderWindow.webContents.send('asynchronous-message', { type: 'loadTasksData' })
				}
			}
		]
	},
	{
		role: 'windowMenu'
	},
	{
		label: '&Help',
		submenu: [
			{
				label: 'Report an Issue...',
				click() {
					shell.openExternal('https://github.com/HuntJSparra/TaskMasterer/issues/new/choose')
				}
			}
		]
	}
]

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
app.whenReady().then(createWindow)


// Messaging
ipcMain.on('synchronous-message', (event, arg) => processMessage(event, arg))
function processMessage(event, arg) {
	if (arg.type === 'loadTasksData') {
		event.returnValue = loadTasksDataMain()
	} else if (arg.type === 'saveTasksData') {
		event.returnValue = saveTasksDataMain(arg.data)
	} else if (arg.type === 'saveAsTasksData') {
		event.returnValue = saveAsTasksDataMain(arg.data)
	} else {
		event.returnValue = "Bad request" // If nothing is returned, then synchcronous processes will hang
	}
}


// File I/O
let save_file_path = undefined

function saveAsTasksDataMain(tasksData) {
	old_path = save_file_path
	save_file_path = undefined

	let ret = saveTasksDataMain(tasksData)

	// Restore old path if Save As... is canceled
	if (ret === 'Cancel') {
		save_file_path = old_path
	}

	return ret
}

function saveTasksDataMain(tasksData) {
	let dialogOptionsObject = {
		properties: ['showOverwriteConfirmation', 'createDirectory'],
	  	filters: [
	  		{name: 'TasksData', extensions: ['tasks']},
	  	]
	}

	// If the user has not selected a path+name, have them do so
	if (save_file_path === undefined) {
		save_file_path = dialog.showSaveDialogSync(renderWindow, dialogOptionsObject)
	}

	// Check for cancel during path+name selection
	if (save_file_path === undefined) {
		return "Cancel"
	}

	let dataToWrite = JSON.stringify(tasksData)
	fs.writeFile(save_file_path, dataToWrite, (error) => { if (error) console.log("Error") }) // I really should add better error handling
	return 'Success!'
}

function loadTasksDataMain() {
	let dialogOptionsObject = {
		properties: ['openFile'],
	  	filters: [
	  		{name: 'TasksData', extensions: ['tasks']},
	  		{name: 'All Files', extensions: ['*']}
	  	]
	}
	let file_path = dialog.showOpenDialogSync(renderWindow, dialogOptionsObject)

	if (file_path === undefined) {
		return // Undefined files cannot be read
	} else {
		file_path = file_path[0] // showOpenDialogSync() actually returns a list of paths (which is only 1 in this case)
	}

	let file = fs.readFileSync(file_path) // I should probably have some error catching
	try {
		let parsedFile = JSON.parse(file.toString())
		save_file_path = file_path
		return parsedFile
	} catch (error) {
		let errorDialogueOptionsObject = {
			type: "error",
			message: "Failed to load file"
		}
		dialog.showMessageBox(renderWindow, errorDialogueOptionsObject)
		return // Cannot return an object if its file cannot be parsed
	}
}