const version = "pre-release"

// CSS Consts
const tasksDataCSS = "TasksData"

const taskRowCSS = "TaskRow"

	// Task Columns
	const taskColumnCSS = "TaskColumn"
	const taskColumnNameCSS = "name"
	const taskColumnBodyCSS = "TaskColumnBody"

	// Task Folder
	const taskFolderCSS = "TaskFolder"
	const taskFolderNameCSS = "name"
	const taskFolderBodyCSS = "TaskFolderBody"

	// Task Cards
	const taskCardCSS = "TaskCard"
	const taskCardCardNameCSS = "cardName"
	const taskCardShortDescCSS = "shortDescription"

	// Buttons
	const addColumnButtonCSS = "AddColumnButton"
	const addFolderButtonCSS = "AddFolderButton"
	const addCardButtonCSS = "AddCardButton"

// Global variables
let draggedElementType = "unassigned"
let mostRecentlyDraggedElement= null
let highlightedDropButton = null

// MOST GENERAL FACTORIES
function createTasksData(versionStr, taskColumnsList) {
	return {
		version: versionStr,
		taskColumns: taskColumnsList
	}
}

function createTaskColumn(nameStr, uncategorizedCardsList, taskFoldersList) {
	return {
		name: nameStr,
		uncategorizedCards: uncategorizedCardsList,
		taskFolders: taskFoldersList
	}
}

function createTaskFolder(nameStr, taskCardsList) {
	return {
		name: nameStr,
		taskCards: taskCardsList
	}
}

function createTaskCard(nameStr, shortDescStr, longDescStr, effortStr) {
	return {
		name: nameStr,
		shortDesc: shortDescStr,
		longDesc: longDescStr,
		effort: effortStr
	}
}

// Defaults
function createDefaultTasksData() {
	let newFileTaskColumn = createDefaultColumn()
	return createTasksData(version, [newFileTaskColumn])
}

function createDefaultFolder() {
	return createTaskFolder("Folder Name", [])
}

function createDefaultColumn() {
	return createTaskColumn("Name", [], [])
}

function createDefaultCard() {
	return createTaskCard("Name", "Short description...", "Long description", "Effort")
}


// DOM

// Creation
	exports.createTasksDataDOM = (tasksData) => createTasksDataDOM(tasksData)
	function createTasksDataDOM(tasksData) {
		// Creates the TasksData div+children that will be under body
		// Returns the Element for the TasksData div
		
		// TODO: Check for version, add support for rows

		// Create TasksData div
		let tasksDataDiv = document.createElement('div')
		tasksDataDiv.className = tasksDataCSS

		// Create TaskRow
		let taskRowDiv = document.createElement('div')
		taskRowDiv.className = taskRowCSS
		tasksDataDiv.appendChild(taskRowDiv)

		// Create TaskColumns
		for (const tCol of tasksData.taskColumns) {
			// Add add column button before each columns
			taskRowDiv.appendChild(createAddColumnButtonDOM())

			// Add the actual column
			let newColumnDiv = createTaskColumnDOM(tCol)
			taskRowDiv.appendChild(newColumnDiv)
		}

		// Add add column button after all columns
		taskRowDiv.appendChild(createAddColumnButtonDOM())

		// Finished
		return tasksDataDiv
	}

	function createTaskColumnDOM(taskColumn) {
		// Create the TasksColumn div and return the new Element

		// TODO: Add support for folders

		// Create column div
		let taskColumnDiv = document.createElement('div')
		taskColumnDiv.className = taskColumnCSS
		taskColumnDiv.tabIndex = '0'
		taskColumnDiv.draggable = true
		taskColumnDiv.addEventListener("keydown", (event) => {if (event.keyCode == 8) {deleteColumnDOM(event.currentTarget)}})
		taskColumnDiv.addEventListener("dragstart", (event) => {columnDragStartDOM(event)})
		taskColumnDiv.addEventListener("dragover", (event) => {columnDragOverColumnDOM(event)}) // When the drag is over an element (NOT when it ends/dropped)
		taskColumnDiv.addEventListener("dragleave", (event) => {columnDragLeaveColumnDOM(event)})
		taskColumnDiv.addEventListener("drop", (event) => {columnDragDropOnColumnDOM(event)})

		// Add name
		let tColNameP = createEditableParagraphDOM()
		tColNameP.className = taskColumnNameCSS
		tColNameP.innerHTML = taskColumn.name
		taskColumnDiv.appendChild(tColNameP)

		// Add TaskColumnBodyDiv + TaskCards
		let tColBodyDiv = document.createElement('div')
		tColBodyDiv.className = taskColumnBodyCSS
		taskColumnDiv.appendChild(tColBodyDiv)

		// Add cards + buttons
		for (const card of taskColumn.uncategorizedCards) {
			// Add an add card button before each card
			tColBodyDiv.appendChild(createAddCardButtonDOM())

			// Add the actual card
			let newCard = createTaskCardDOM(card)
			tColBodyDiv.appendChild(newCard)
		}

		// Add an add card button after all unorganized cards
		tColBodyDiv.appendChild(createAddCardButtonDOM())

		for (const folder of taskColumn.taskFolders) {
			// Add an add folder button before each folder
			tColBodyDiv.appendChild(createAddFolderButtonDOM())

			// Add the actual folder
			let newFolder = createTaskFolderDOM(folder)
			tColBodyDiv.appendChild(newFolder)
		}

		// Add an add folder button after all folder (if any)
		tColBodyDiv.appendChild(createAddFolderButtonDOM())

		// Finished
		return taskColumnDiv
	}

	function createTaskFolderDOM(taskFolder) {
		// Create task folder and return div
		let taskFolderDiv = document.createElement('div')
		taskFolderDiv.className = taskFolderCSS
		taskFolderDiv.tabIndex = '0'
		taskFolderDiv.draggable = true
		taskFolderDiv.addEventListener("keydown", (event) => {if (event.keyCode == 8) {deleteFolderDOM(event.currentTarget)}})
		taskFolderDiv.addEventListener("dragstart", (event) => {folderDragStartDOM(event)})
		taskFolderDiv.addEventListener("dragover", (event) => {folderDragOverFolderDOM(event)}) // When the drag is over an element (NOT when it ends/dropped)
		taskFolderDiv.addEventListener("dragleave", (event) => {folderDragLeaveFolderDOM(event)})
		taskFolderDiv.addEventListener("drop", (event) => {folderDragDropOnFolderDOM(event)})

		// Add name
		let tFolderNameP = createEditableParagraphDOM()
		tFolderNameP.className = taskFolderNameCSS
		tFolderNameP.innerHTML = taskFolder.name
		taskFolderDiv.appendChild(tFolderNameP)

		// Add body for cards
		let tFolderBodyDiv = document.createElement('div')
		tFolderBodyDiv.className = taskFolderBodyCSS
		taskFolderDiv.appendChild(tFolderBodyDiv)

		// Add cards + buttons
		for (const card of taskFolder.taskCards) {
			// Add an add card button before each card
			tFolderBodyDiv.appendChild(createAddCardButtonDOM())

			// Add the actual card
			let newCard = createTaskCardDOM(card)
			tFolderBodyDiv.appendChild(newCard)
		}

		// Add button after all cards (so every card has a button above and below it)
		tFolderBodyDiv.appendChild(createAddCardButtonDOM())

		return taskFolderDiv
	}

	function createTaskCardDOM(taskCard) {
		// Create the TaskCard div and return the new Element

		// TODO: Support for effort and long description

		// Create card div
		let taskCardDiv = document.createElement('div')
		taskCardDiv.className = taskCardCSS
		taskCardDiv.tabIndex = '0'
		taskCardDiv.draggable = true
		taskCardDiv.addEventListener("keydown", (event) => {if (event.keyCode == 8) {deleteCardDOM(event.currentTarget)}})
		taskCardDiv.addEventListener("dragstart", (event) => {cardDragStartDOM(event)})
		taskCardDiv.addEventListener("dragover", (event) => {cardDragOverCardDOM(event)}) // When the drag is over an element (NOT when it ends/dropped)
		taskCardDiv.addEventListener("dragleave", (event) => {cardDragLeaveCardDOM(event)})
		taskCardDiv.addEventListener("drop", (event) => {cardDragDropOnCardDOM(event)})

		// Add name
		let tCardNameP = createEditableParagraphDOM()
		tCardNameP.className = taskCardCardNameCSS
		tCardNameP.innerHTML = taskCard.name
		taskCardDiv.appendChild(tCardNameP)

		// Add short desc
		let tCardShortDescP = createEditableParagraphDOM()
		tCardShortDescP.className = taskCardShortDescCSS
		tCardShortDescP.innerHTML = taskCard.shortDesc
		taskCardDiv.appendChild(tCardShortDescP)

		// Finished
		return taskCardDiv
	}


	// Smaller bits and pieces of DOM
	function createEditableParagraphDOM() {
		let editableParagraph = document.createElement('p')
		editableParagraph.addEventListener("dblclick", (event) => makeElementEditableDOM(event.currentTarget))
		editableParagraph.addEventListener("blur", (event) => makeElementUneditableDOM(event.currentTarget))
		editableParagraph.addEventListener("keydown", (event) => {if (event.keyCode == 27) {makeElementUneditableDOM(event.currentTarget)}})

		return editableParagraph
	}

	function createAddColumnButtonDOM() {
		let addColumnButton = document.createElement('button')
		addColumnButton.className = addColumnButtonCSS
		addColumnButton.textContent = '+'
		addColumnButton.addEventListener("click", (event) => addColumnDOM(event.currentTarget, createDefaultColumnDOM()))
		addColumnButton.addEventListener("dragover", (event) => {columnDragOverButtonDOM(event)}) // When the drag is over an element (NOT when it ends/dropped)
		addColumnButton.addEventListener("dragleave", (event) => {columnDragLeaveButtonDOM(event)})
		addColumnButton.addEventListener("drop", (event) => {columnDragDropOnButtonDOM(event)})

		return addColumnButton;
	}

	function createAddFolderButtonDOM() {
		let addFolderButton = document.createElement('button')
		addFolderButton.className = addFolderButtonCSS
		addFolderButton.textContent = 'F'
		addFolderButton.addEventListener("click", (event) => addFolderDOM(event.currentTarget, createDefaultFolderDOM()))
		addFolderButton.addEventListener("dragover", (event) => {folderDragOverButtonDOM(event)}) // When the drag is over an element (NOT when it ends/dropped)
		addFolderButton.addEventListener("dragleave", (event) => {folderDragLeaveButtonDOM(event)})
		addFolderButton.addEventListener("drop", (event) => {folderDragDropOnButtonDOM(event)})

		return addFolderButton;
	}

	function createAddCardButtonDOM() {
		let addCardButton = document.createElement('button')
		addCardButton.className = addCardButtonCSS
		addCardButton.textContent = '+'
		addCardButton.addEventListener("click", (event) => addCardDOM(event.currentTarget, createDefaultCardDOM()))
		addCardButton.addEventListener("dragover", (event) => {cardDragOverButtonDOM(event)}) // When the drag is over an element (NOT when it ends/dropped)
		addCardButton.addEventListener("dragleave", (event) => {cardDragLeaveButtonDOM(event)})
		addCardButton.addEventListener("drop", (event) => {cardDragDropOnButtonDOM(event)})

		return addCardButton;
	}

// Saving/Loading
	exports.loadTasksDataDOM = (tasksDataDiv) => loadTasksDataDOM(tasksDataDiv)
	function loadTasksDataDOM(tasksDataDiv) {
		// Remove old tasksDataDiv (if it exists)
		if (document.body.children.length > 1) {
			document.body.children[1].remove() // The second element is always the div for the tasksData
		}

		document.body.appendChild(tasksDataDiv)
	}

	exports.domToTasksData = () => domToTasksData()
	function domToTasksData() {
		// Unlike the other functions in this "family", domToTaskData() gets its div
		// (instead of being passed it)

		let tasksDataDiv = document.body.children[1] // The second element is always the div for the tasksData

		let taskRow = tasksDataDiv.firstChild // In the future, when rows are supported, this will be turned to a foreach row loop

		let taskColumnsList = []
		for (let index=0; index<taskRow.children.length; index++) {
			let child = taskRow.children[index]
			// Only task column children should be added (ignore buttons)
			if (child.classList.contains(taskColumnCSS)) {
				let column = domToTaskColumn(child)
				taskColumnsList.push(column)
			}
		}

		return createTasksData(version, taskColumnsList)
	}

	function domToTaskColumn(columnDiv) {
		let columnName = columnDiv.firstChild.innerHTML // First child is the paragraph

		let taskColumnBody = columnDiv.children[1] // Second child is the div that contains the cards and folders
		let unorganizedCards = []
		let taskFolders = []
		for (let index=0; index<taskColumnBody.children.length; index++) {
			let child = taskColumnBody.children[index]
			// Only process task cards and folders
			if (child.classList.contains(taskCardCSS)) {
				let card = domToTaskCard(child)
				unorganizedCards.push(card)
			} else if (child.classList.contains(taskFolderCSS)) {
				let folder = domToTaskFolder(child)
				taskFolders.push(folder)
			}
		}

		return createTaskColumn(columnName, unorganizedCards, taskFolders)
	}

	function domToTaskFolder(folderDiv) {
		let folderName = folderDiv.firstChild.innerHTML // First child is the paragraph

		let taskFolderBody = folderDiv.children[1] // Second child is the div that contains the cards and folders
		let cards = []
		for (let index=0; index<taskFolderBody.children.length; index++) {
			let child = taskFolderBody.children[index]
			// Only process task cards (ignore buttons)
			if (child.classList.contains(taskCardCSS)) {
				let card = domToTaskCard(child)
				cards.push(card)
			}
		}

		return createTaskFolder(folderName, cards)
	}

	function domToTaskCard(cardDiv) {
		let cardName = cardDiv.firstChild.innerHTML
		let cardShortDesc = cardDiv.children[1].innerHTML
		let cardLongDesc = "" // Not yet supported
		let cardEffort = "" // Not yet supported

		return createTaskCard(cardName, cardShortDesc, cardLongDesc, cardEffort)
	}

// Edit
	function makeElementEditableDOM(element) {
		element.contentEditable = true
		element.focus()
	}

	function makeElementUneditableDOM(element) {
		element.contentEditable = false

		if (element === document.activeElement) {
			element.blur()
		}
	}

// Add
	function addColumnDOM(elementToAddBefore, columnElementToAdd) {
		elementToAddBefore.insertAdjacentElement('afterend', createAddColumnButtonDOM()) // Add an additional new button to go AFTER the new column (which itself is AFTER the target button)
		elementToAddBefore.insertAdjacentElement('afterend', columnElementToAdd)

	}

	function addFolderDOM(elementToAddBefore, folderElementToAdd) {
		elementToAddBefore.insertAdjacentElement('afterend', createAddFolderButtonDOM()) // Add an additional new button to go AFTER the new folder (which itself is AFTER the target button)
		elementToAddBefore.insertAdjacentElement('afterend', folderElementToAdd)
	}

	function addCardDOM(elementToAddBefore, cardElementToAdd) {
		elementToAddBefore.insertAdjacentElement('afterend', createAddCardButtonDOM()) // Add an additional new button to go AFTER the new card (which itself is AFTER the target button)
		elementToAddBefore.insertAdjacentElement('afterend', cardElementToAdd)

	}

// Delete
	function deleteColumnDOM(taskColumnDiv) {
		if (taskColumnDiv === document.activeElement) {
			taskColumnDiv.nextSibling.remove()
			taskColumnDiv.remove()
		}
	}

	function deleteFolderDOM(taskFolder) {
		if (taskFolder === document.activeElement) {
			taskFolder.nextSibling.remove()
			taskFolder.remove()
		}
	}

	function deleteCardDOM(taskCardDiv) {
		if (taskCardDiv === document.activeElement) {
			taskCardDiv.nextSibling.remove()
			taskCardDiv.remove()
		}
	}

// Dragging
	// Column
	function columnDragStartDOM(event) {
		event.stopPropagation()
		if (event.target !== event.currentTarget) { // We only drag the outer div, not individual subelements (or text)
			event.preventDefault()
			return
		}

		mostRecentlyDraggedElement = event.currentTarget
		draggedElementType = "column"
	}

	function columnDragOverColumnDOM(event) {
		if (draggedElementType !== "column") {
			return
		}

		event.preventDefault() // Why is supressing the default required for dropzones?

		// Event is fired for subelements because if not, those elements block the div's dropzone+events

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		// Assign new button
		highlightedDropButton = event.currentTarget.previousSibling
		highlightedDropButton.style.backgroundColor = "red"
	}

	function columnDragOverButtonDOM(event) {
		if (draggedElementType !== "column") {
			return
		}

		event.preventDefault() // Why is supressing the default required for dropzones?

		// Event is fired for subelements because if not, those elements block the div's dropzone+events

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		// Assign new button
		highlightedDropButton = event.currentTarget
		highlightedDropButton.style.backgroundColor = "red"
	}

	function columnDragLeaveColumnDOM(event) {
		if (draggedElementType !== "column") {
			return
		}

		event.preventDefault()

		if (event.currentTarget !== event.target) {
			return // Do not fire event for subelements
		}

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}
	}

	function columnDragLeaveButtonDOM(event) {
		if (draggedElementType !== "column") {
			return
		}

		event.preventDefault()

		if (event.currentTarget !== event.target) {
			return // Do not fire event for subelements
		}

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}
	}

	function columnDragDropOnColumnDOM(event) {
		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		if (draggedElementType !== "column") {
			return
		}

		event.preventDefault()

		if (event.currentTarget === mostRecentlyDraggedElement) {
			return // Unexpected behavior occurs when dropping/moving a card onto itself
		}

		let dropZoneElement = event.currentTarget
		let buttonToMove = mostRecentlyDraggedElement.nextSibling

		// Move card first
		dropZoneElement.insertAdjacentElement('beforeBegin', mostRecentlyDraggedElement)

		// Move button after so it will be between the moved card and the dropzone card
		dropZoneElement.insertAdjacentElement('beforeBegin', buttonToMove)
	}

	function columnDragDropOnButtonDOM(event) {
		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		if (draggedElementType !== "column") {
			return
		}

		event.preventDefault()

		let dropZoneElement = event.currentTarget
		let buttonToMove = mostRecentlyDraggedElement.nextSibling

		// Move button
		dropZoneElement.insertAdjacentElement('beforeBegin', buttonToMove)

		// Move card next so it will be between the two buttons
		dropZoneElement.insertAdjacentElement('beforeBegin', mostRecentlyDraggedElement)
	}

	// Folder
	function folderDragStartDOM(event) {
		event.stopPropagation()
		if (event.target !== event.currentTarget) { // We only drag the outer div, not individual subelements (or text)
			event.preventDefault()
			return
		}

		mostRecentlyDraggedElement = event.currentTarget
		draggedElementType = "folder"
	}

	function folderDragOverFolderDOM(event) {
		if (draggedElementType !== "folder") {
			return
		}

		event.preventDefault() // Why is supressing the default required for dropzones?

		// Event is fired for subelements because if not, those elements block the div's dropzone+events

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		// Assign new button
		highlightedDropButton = event.currentTarget.previousSibling
		highlightedDropButton.style.backgroundColor = "red"
	}

	function folderDragOverButtonDOM(event) {
		if (draggedElementType !== "folder") {
			return
		}

		event.preventDefault() // Why is supressing the default required for dropzones?

		// Event is fired for subelements because if not, those elements block the div's dropzone+events

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		// Assign new button
		highlightedDropButton = event.currentTarget
		highlightedDropButton.style.backgroundColor = "red"
	}

	function folderDragLeaveFolderDOM(event) {
		if (draggedElementType !== "folder") {
			return
		}

		event.preventDefault()

		if (event.currentTarget !== event.target) {
			return // Do not fire event for subelements
		}

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}
	}

	function folderDragLeaveButtonDOM(event) {
		if (draggedElementType !== "folder") {
			return
		}

		event.preventDefault()

		if (event.currentTarget !== event.target) {
			return // Do not fire event for subelements
		}

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}
	}

	function folderDragDropOnFolderDOM(event) {
		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		if (draggedElementType !== "folder") {
			return
		}

		event.preventDefault()

		if (event.currentTarget === mostRecentlyDraggedElement) {
			return // Unexpected behavior occurs when dropping/moving a card onto itself
		}

		let dropZoneElement = event.currentTarget
		let buttonToMove = mostRecentlyDraggedElement.nextSibling

		// Move card first
		dropZoneElement.insertAdjacentElement('beforeBegin', mostRecentlyDraggedElement)

		// Move button after so it will be between the moved card and the dropzone card
		dropZoneElement.insertAdjacentElement('beforeBegin', buttonToMove)
	}

	function folderDragDropOnButtonDOM(event) {
		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		if (draggedElementType !== "folder") {
			return
		}

		event.preventDefault()

		let dropZoneElement = event.currentTarget
		let buttonToMove = mostRecentlyDraggedElement.nextSibling

		// Move button
		dropZoneElement.insertAdjacentElement('beforeBegin', buttonToMove)

		// Move card next so it will be between the two buttons
		dropZoneElement.insertAdjacentElement('beforeBegin', mostRecentlyDraggedElement)
	}

	// Card
	function cardDragStartDOM(event) {
		event.stopPropagation()
		if (event.target !== event.currentTarget) { // We only drag the outer div, not individual subelements (or text)
			event.preventDefault()
			return
		}

		mostRecentlyDraggedElement = event.currentTarget
		draggedElementType = "card"
	}

	function cardDragOverCardDOM(event) {
		if (draggedElementType !== "card") {
			return
		}

		event.preventDefault() // Why is supressing the default required for dropzones?

		// Event is fired for subelements because if not, those elements block the div's dropzone+events

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		// Assign new button
		highlightedDropButton = event.currentTarget.previousSibling
		highlightedDropButton.style.backgroundColor = "red"
	}

	function cardDragOverButtonDOM(event) {
		if (draggedElementType !== "card") {
			return
		}

		event.preventDefault() // Why is supressing the default required for dropzones?

		// Event is fired for subelements because if not, those elements block the div's dropzone+events

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		// Assign new button
		highlightedDropButton = event.currentTarget
		highlightedDropButton.style.backgroundColor = "red"
	}

	function cardDragLeaveCardDOM(event) {
		if (draggedElementType !== "card") {
			return
		}

		event.preventDefault()

		if (event.currentTarget !== event.target) {
			return // Do not fire event for subelements
		}

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}
	}

	function cardDragLeaveButtonDOM(event) {
		if (draggedElementType !== "card") {
			return
		}

		event.preventDefault()

		if (event.currentTarget !== event.target) {
			return // Do not fire event for subelements
		}

		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}
	}

	function cardDragDropOnCardDOM(event) {
		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		if (draggedElementType !== "card") {
			return
		}

		event.preventDefault()

		if (event.currentTarget === mostRecentlyDraggedElement) {
			return // Unexpected behavior occurs when dropping/moving a card onto itself
		}

		let dropZoneElement = event.currentTarget
		let buttonToMove = mostRecentlyDraggedElement.nextSibling

		// Move card first
		dropZoneElement.insertAdjacentElement('beforeBegin', mostRecentlyDraggedElement)

		// Move button after so it will be between the moved card and the dropzone card
		dropZoneElement.insertAdjacentElement('beforeBegin', buttonToMove)
	}

	function cardDragDropOnButtonDOM(event) {
		// Reset old button
		if (highlightedDropButton !== null) {
			highlightedDropButton.style = ""
		}

		if (draggedElementType !== "card") {
			return
		}

		event.preventDefault()

		let dropZoneElement = event.currentTarget
		let buttonToMove = mostRecentlyDraggedElement.nextSibling

		// Move button
		dropZoneElement.insertAdjacentElement('beforeBegin', buttonToMove)

		// Move card next so it will be between the two buttons
		dropZoneElement.insertAdjacentElement('beforeBegin', mostRecentlyDraggedElement)
	}

// Presets
	exports.createDefaultTasksDataDOM = (tasksData) => createDefaultTasksDataDOM(tasksData)
	function createDefaultTasksDataDOM() {
		return createTasksDataDOM(createDefaultTasksData())
	}

	function createDefaultColumnDOM() {
		return createTaskColumnDOM(createDefaultColumn())
	}

	function createDefaultFolderDOM() {
		return createTaskFolderDOM(createDefaultFolder())
	}

	function createDefaultCardDOM() {
		return createTaskCardDOM(createDefaultCard())
	}

// TESTING

exports.createTestTasksData = () => createTestTasksData()
function createTestTasksData() {
	// Create cards
	let zeroCardList = []
	let oneCardList = [createTestTaskCard()]
	let twoCardList = [createTestTaskCard(), createTestTaskCard()]
	let fiveCardList = [createTestTaskCard(), createTestTaskCard(), createTestTaskCard(), createTestTaskCard(), createTestTaskCard()]

	// Create columns
	let zeroCol = createTaskColumn("Test Column", zeroCardList, [])
	let oneCol = createTaskColumn("Test Column", oneCardList, [])
	let twoCol = createTaskColumn("Test Column", twoCardList, [])
	let fiveCol = createTaskColumn("Test Column", fiveCardList, [])

	// Create data
	return createTasksData("TEST ONLY", [zeroCol, oneCol, twoCol, fiveCol])
}

function createTestTaskCard() {
	return createTaskCard("Test Name", "This is a short description for the card.",
		"A much longer description should run multiple lines and fully describe the task and other details.",
		"effort")
}