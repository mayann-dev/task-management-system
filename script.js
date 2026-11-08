let tasks = [];

// Get tasks from the database
async function loadTasks() {
    const response = await fetch('/api/tasks');
    tasks = await response.json();
    displayTasks();
}

// Add a new task
async function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();

    if (title === "") {
        alert("Please enter a task title!");
        return;
    }

    const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
    });

    if (response.ok) {
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
        loadTasks();
    } else {
        alert("Could not add task.");
    }
}

// Display tasks
function displayTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const searchTerm = document.getElementById("searchTask").value.toLowerCase();
const statusFilter = document.getElementById("statusFilter").value;

const filteredTasks = tasks.filter(task => {
    const matchesSearch =
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description || "").toLowerCase().includes(searchTerm);

    const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
});

filteredTasks.forEach(task => {

        const item = document.createElement("div");
        item.style.padding = "15px";
        item.style.marginBottom = "15px";
        item.style.border = "1px solid #ddd";
        item.style.borderRadius = "8px";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description || "";

       const status = document.createElement("p");
status.textContent = "Status: " + task.status;
status.style.fontWeight = "bold";
status.style.color = task.status === "Completed" ? "#16a34a" : "#d97706";
        const completeButton = document.createElement("button");
        completeButton.textContent = task.status === "Pending" ? "Complete" : "Undo";
        completeButton.onclick = () => updateTask(task);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.style.marginLeft = "8px";
        editButton.onclick = () => editTask(task);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "8px";
        deleteButton.onclick = () => deleteTask(task.id);

        item.append(title, description, status,
            completeButton, editButton, deleteButton);

        taskList.appendChild(item);
    });

    updateSummary();
}

// Update task status
async function updateTask(task) {
    const newStatus = task.status === "Pending" ? "Completed" : "Pending";

    await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: task.title,
            description: task.description,
            status: newStatus
        })
    });

    loadTasks();
}

// Edit task
async function editTask(task) {
    const newTitle = prompt("Enter new task title:", task.title);

    if (newTitle === null || newTitle.trim() === "") return;

    const newDescription = prompt(
        "Enter new description:", task.description || ""
    );

    if (newDescription === null) return;

    await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: newTitle.trim(),
            description: newDescription.trim(),
            status: task.status
        })
    });

    loadTasks();
}

// Delete task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
    });

    loadTasks();
}

// Update dashboard numbers
function updateSummary() {
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => task.status === "Pending").length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.status === "Completed").length;
}

// Connect Add Task button
document.getElementById("addTaskBtn").addEventListener("click", addTask);
document.getElementById("searchTask").addEventListener("input", displayTasks);
document.getElementById("statusFilter").addEventListener("change", displayTasks);



// Load saved tasks when the page opens
loadTasks();