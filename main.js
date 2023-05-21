const { app, BrowserWindow, contextBridge, ipcMain, dialog, Menu, shell } = require('electron')
const fs = require('fs') // path.resolve be used with this?
const path = require('path')

let renderWindow = null // Will be defined later

function createWindow () {
	renderWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, "preload.js") // Electron requires preload files to be on an absolute path
		}
	})

    renderWindow.loadFile('main.html')

	//renderWindow.webContents.openDevTools()
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
					renderWindow.webContents.send('newFile')
				}
			},
			{
				label: 'Save',
				accelerator: 'CmdOrCtrl+S',
				click() {
					renderWindow.webContents.send('saveTasksData')
				}
			},
			{ 
				label: 'Save As...',
				accelerator: 'CmdOrCtrl+Shift+S',
				click() {
					renderWindow.webContents.send('saveAsTasksData')
				}	
			},
			{
				label: 'Open...',
				accelerator: 'CmdOrCtrl+O',
				click() {
					renderWindow.webContents.send('loadTasksData')
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

let firstFile = null
Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
app.whenReady().then(createWindow).then(() => {
    renderWindow.webContents.once("did-finish-load", () => {
        if (process.argv.length>=2 && process.argv[1].endsWith(".tasks")) {
            firstFile = process.argv[1]
        }
        if (firstFile !== null) {
            try {
                renderWindow.webContents.send('loadTasksData', firstFile)
            } catch {
                console.log("Failed to load initial task data")
            }
        }
    })
})
app.on('open-file', (event, path) =>
{
    event.preventDefault()
    if (renderWindow !== null) {
        renderWindow.webContents.send('loadTasksData', path)
    } else {
        firstFile = path
    }
})

// Messaging
ipcMain.handle('loadTasksData', loadTasksDataMain)
ipcMain.on('saveTasksData', saveTasksDataMain)
ipcMain.on('saveAsTasksData', saveAsTasksDataMain)


// File I/O
let save_file_path = undefined

function saveAsTasksDataMain(event, tasksData) {
	old_path = save_file_path
	save_file_path = undefined

	let ret = saveTasksDataMain(event, tasksData)

	// Restore old path if Save As... is canceled
	if (ret === 'Cancel') {
		save_file_path = old_path
	}

	return ret
}

function saveTasksDataMain(event, tasksData) {
	let dialogOptionsObject = {
		properties: ['showOverwriteConfirmation', 'createDirectory'],
	  	filters: [
	  		{name: 'TasksData', extensions: ['tasks']},
	  	]
	}

	// If the user has not selected a path+name, have them do so
	if (save_file_path === undefined || save_file_path === null) {
		save_file_path = dialog.showSaveDialogSync(renderWindow, dialogOptionsObject)
	}

	// Check for cancel during path+name selection
	if (save_file_path === undefined || save_file_path === null) {
		return "Cancel"
	}

	let dataToWrite = JSON.stringify(tasksData)
	fs.writeFile(save_file_path, dataToWrite, (error) => { if (error) console.log("Error") }) // I really should add better error handling
	return 'Success!'
}

function loadTasksDataMain(event, file_path) {
    if (file_path === undefined) {
        let dialogOptionsObject = {
        properties: ['openFile'],
          filters: [
              {name: 'TasksData', extensions: ['tasks']},
              {name: 'All Files', extensions: ['*']}
          ]
        }
        file_path = dialog.showOpenDialogSync(renderWindow, dialogOptionsObject)
	}

	if (file_path === undefined) {
		return // Undefined files cannot be read
	} else if (Array.isArray(file_path)) {
		file_path = file_path[0] // showOpenDialogSync() actually returns a list of paths (which is only 1 in this case)
	}


	try {
        let file = fs.readFileSync(file_path)
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