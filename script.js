/* =========================================
   NEXUS PRODUCTIVITY DASHBOARD
   Vanilla JavaScript
========================================= */

const STORAGE_KEY = "nexus_tasks";
const THEME_KEY = "nexus_theme";

/* =========================================
   DEFAULT TASKS
========================================= */

const defaultTasks = [
  {
    id: 1,
    title: "Design landing page",
    description: "Create the new landing page design.",
    priority: "high",
    status: "progress",
    date: "2026-09-11"
  },
  {
    id: 2,
    title: "Review project requirements",
    description: "Review requirements with the development team.",
    priority: "medium",
    status: "todo",
    date: "2026-09-11"
  },
  {
    id: 3,
    title: "Prepare presentation",
    description: "Prepare slides for the client presentation.",
    priority: "high",
    status: "todo",
    date: "2026-09-12"
  },
  {
    id: 4,
    title: "Update documentation",
    description: "Update product documentation.",
    priority: "low",
    status: "completed",
    date: "2026-09-10"
  },
  {
    id: 5,
    title: "Team meeting",
    description: "Weekly product team meeting.",
    priority: "medium",
    status: "progress",
    date: "2026-09-11"
  },
  {
    id: 6,
    title: "Fix responsive layout",
    description: "Improve mobile responsiveness.",
    priority: "high",
    status: "todo",
    date: "2026-09-13"
  },
  {
    id: 7,
    title: "Deploy new version",
    description: "Deploy the latest application build.",
    priority: "medium",
    status: "completed",
    date: "2026-09-09"
  }
];

/* =========================================
   STATE
========================================= */

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY));

if (!Array.isArray(tasks) || tasks.length === 0) {
  tasks = defaultTasks;
  saveTasks();
}

let currentFilter = "all";
let currentPriority = "all";
let draggedTaskId = null;

/* =========================================
   DOM
========================================= */

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");

const taskId = document.getElementById("taskId");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskStatus = document.getElementById("taskStatus");
const taskDate = document.getElementById("taskDate");

const modalTitle = document.getElementById("modalTitle");

const todoColumn = document.getElementById("todoColumn");
const progressColumn = document.getElementById("progressColumn");
const completedColumn = document.getElementById("completedColumn");

const todayTasks = document.getElementById("todayTasks");

/* =========================================
   SAVE
========================================= */

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* =========================================
   NAVIGATION
========================================= */

function showPage(pageId) {

  pages.forEach(page => {
    page.classList.remove("active");
  });

  navItems.forEach(item => {
    item.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  const activeNav = document.querySelector(
    `.nav-item[data-page="${pageId}"]`
  );

  if (activeNav) {
    activeNav.classList.add("active");
  }

  document.getElementById("sidebar")?.classList.remove("open");

  if (pageId === "calendar") {
    renderCalendar();
  }
}

navItems.forEach(item => {

  item.addEventListener("click", () => {

    const page = item.dataset.page;

    showPage(page);

  });

});


/* Buttons that contain data-page */

document.addEventListener("click", event => {

  const pageButton = event.target.closest("[data-page]");

  if (
    pageButton &&
    !pageButton.classList.contains("nav-item")
  ) {

    showPage(pageButton.dataset.page);

  }

});


/* =========================================
   MOBILE MENU
========================================= */

document
  .getElementById("mobileMenu")
  ?.addEventListener("click", () => {

    document
      .getElementById("sidebar")
      ?.classList.toggle("open");

  });


/* =========================================
   MODAL
========================================= */

function openTaskModal(task = null) {

  taskModal.classList.add("open");

  if (task) {

    modalTitle.textContent = "Edit Task";

    taskId.value = task.id;
    taskTitle.value = task.title;
    taskDescription.value = task.description || "";
    taskPriority.value = task.priority;
    taskStatus.value = task.status;
    taskDate.value = task.date || "";

  } else {

    modalTitle.textContent = "Create New Task";

    taskForm.reset();

    taskId.value = "";

    taskPriority.value = "medium";
    taskStatus.value = "todo";

    taskDate.value = "2026-09-11";
  }
}

function closeTaskModal() {
  taskModal.classList.remove("open");
}

document
  .getElementById("modalClose")
  ?.addEventListener("click", closeTaskModal);

document
  .getElementById("cancelModal")
  ?.addEventListener("click", closeTaskModal);

taskModal.addEventListener("click", event => {

  if (event.target === taskModal) {
    closeTaskModal();
  }

});


/* New task buttons */

document
  .getElementById("newTaskBtn")
  ?.addEventListener("click", () => openTaskModal());

document
  .getElementById("dashboardNewTask")
  ?.addEventListener("click", () => openTaskModal());

document
  .getElementById("calendarTaskBtn")
  ?.addEventListener("click", () => openTaskModal());


/* =========================================
   CREATE / EDIT TASK
========================================= */

taskForm.addEventListener("submit", event => {

  event.preventDefault();

  const id = taskId.value;

  const newTask = {
    id: id ? Number(id) : Date.now(),

    title: taskTitle.value.trim(),

    description:
      taskDescription.value.trim(),

    priority:
      taskPriority.value,

    status:
      taskStatus.value,

    date:
      taskDate.value
  };

  if (!newTask.title) {
    showToast("Error", "Please enter a task title.");
    return;
  }

  if (id) {

    const index = tasks.findIndex(
      task => task.id === Number(id)
    );

    if (index !== -1) {
      tasks[index] = newTask;
    }

    showToast(
      "Task Updated",
      "Your task was updated successfully."
    );

  } else {

    tasks.unshift(newTask);

    showToast(
      "Task Created",
      "New task added to your workspace."
    );

  }

  saveTasks();

  renderAll();

  closeTaskModal();

});


/* =========================================
   TASK HTML
========================================= */

function taskHTML(task) {

  const safeTitle = escapeHTML(task.title);
  const safeDescription = escapeHTML(
    task.description || ""
  );

  const formattedDate = task.date
    ? formatDate(task.date)
    : "No due date";

  return `
    <article
      class="kanban-card"
      draggable="true"
      data-id="${task.id}"
    >

      <h3>${safeTitle}</h3>

      ${
        safeDescription
          ? `<p>${safeDescription}</p>`
          : ""
      }

      <div class="task-meta">

        <span class="priority ${task.priority}">
          ${capitalize(task.priority)}
        </span>

        <span class="task-date">
          📅 ${formattedDate}
        </span>

      </div>

      <div class="task-actions">

        <button
          title="Move to To Do"
          onclick="moveTask(${task.id}, 'todo')">
          ○
        </button>

        <button
          title="Move to In Progress"
          onclick="moveTask(${task.id}, 'progress')">
          →
        </button>

        <button
          title="Complete"
          onclick="moveTask(${task.id}, 'completed')">
          ✓
        </button>

        <button
          title="Edit"
          onclick="editTask(${task.id})">
          ✎
        </button>

        <button
          title="Delete"
          onclick="deleteTask(${task.id})">
          ×
        </button>

      </div>

    </article>
  `;
}


/* =========================================
   RENDER KANBAN
========================================= */

function renderKanban() {

  todoColumn.innerHTML = "";
  progressColumn.innerHTML = "";
  completedColumn.innerHTML = "";

  let filteredTasks = [...tasks];

  if (currentFilter !== "all") {

    filteredTasks = filteredTasks.filter(
      task => task.status === currentFilter
    );

  }

  if (currentPriority !== "all") {

    filteredTasks = filteredTasks.filter(
      task => task.priority === currentPriority
    );

  }

  filteredTasks.forEach(task => {

    const html = taskHTML(task);

    if (task.status === "todo") {
      todoColumn.insertAdjacentHTML("beforeend", html);
    }

    if (task.status === "progress") {
      progressColumn.insertAdjacentHTML("beforeend", html);
    }

    if (task.status === "completed") {
      completedColumn.insertAdjacentHTML("beforeend", html);
    }

  });

  updateColumnCounts();

  setupDragAndDrop();

}


/* =========================================
   COLUMN COUNTS
========================================= */

function updateColumnCounts() {

  const todo = tasks.filter(
    task => task.status === "todo"
  ).length;

  const progress = tasks.filter(
    task => task.status === "progress"
  ).length;

  const completed = tasks.filter(
    task => task.status === "completed"
  ).length;

  document.getElementById("todoCount").textContent = todo;

  document.getElementById("progressCount").textContent = progress;

  document.getElementById("completedCount").textContent = completed;

  document.getElementById("taskCountBadge").textContent =
    tasks.filter(task => task.status !== "completed").length;
}


/* =========================================
   DRAG & DROP
========================================= */

function setupDragAndDrop() {

  const cards = document.querySelectorAll(
    ".kanban-card"
  );

  cards.forEach(card => {

    card.addEventListener(
      "dragstart",
      dragStart
    );

    card.addEventListener(
      "dragend",
      dragEnd
    );

  });

  const columns = document.querySelectorAll(
    ".kanban-column"
  );

  columns.forEach(column => {

    column.addEventListener(
      "dragover",
      dragOver
    );

    column.addEventListener(
      "dragleave",
      dragLeave
    );

    column.addEventListener(
      "drop",
      dropTask
    );

  });

}


function dragStart(event) {

  draggedTaskId =
    Number(
      event.currentTarget.dataset.id
    );

  event.currentTarget.classList.add(
    "dragging"
  );

  event.dataTransfer.effectAllowed =
    "move";
}


function dragEnd(event) {

  event.currentTarget.classList.remove(
    "dragging"
  );

  document
    .querySelectorAll(".kanban-column")
    .forEach(column => {
      column.classList.remove("drag-over");
    });

}


function dragOver(event) {

  event.preventDefault();

  event.currentTarget.classList.add(
    "drag-over"
  );

}


function dragLeave(event) {

  event.currentTarget.classList.remove(
    "drag-over"
  );

}


function dropTask(event) {

  event.preventDefault();

  const column =
    event.currentTarget;

  const newStatus =
    column.dataset.status;

  const task =
    tasks.find(
      task => task.id === draggedTaskId
    );

  if (!task) return;

  task.status = newStatus;

  saveTasks();

  renderAll();

  showToast(
    "Task Moved",
    `Task moved to ${statusLabel(newStatus)}.`
  );

  draggedTaskId = null;

}


/* =========================================
   MOVE TASK
========================================= */

function moveTask(id, status) {

  const task =
    tasks.find(task => task.id === id);

  if (!task) return;

  task.status = status;

  saveTasks();

  renderAll();

  showToast(
    "Task Updated",
    `Task moved to ${statusLabel(status)}.`
  );

}


/* =========================================
   EDIT
========================================= */

function editTask(id) {

  const task =
    tasks.find(task => task.id === id);

  if (!task) return;

  openTaskModal(task);

}


/* =========================================
   DELETE
========================================= */

function deleteTask(id) {

  const task =
    tasks.find(task => task.id === id);

  if (!task) return;

  const confirmed =
    confirm(
      `Delete "${task.title}"?`
    );

  if (!confirmed) return;

  tasks =
    tasks.filter(
      task => task.id !== id
    );

  saveTasks();

  renderAll();

  showToast(
    "Task Deleted",
    "The task was removed."
  );

}


/* =========================================
   FILTERS
========================================= */

document
  .querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".filter")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        button.classList.add("active");

        currentFilter =
          button.dataset.filter;

        renderKanban();

      }
    );

  });


document
  .getElementById("priorityFilter")
  ?.addEventListener(
    "change",
    event => {

      currentPriority =
        event.target.value;

      renderKanban();

    }
  );


/* =========================================
   TODAY TASKS
========================================= */

function renderTodayTasks() {

  const today =
    "2026-09-11";

  const todayTaskItems =
    tasks.filter(
      task => task.date === today
    );

  const remaining =
    todayTaskItems.filter(
      task => task.status !== "completed"
    ).length;

  document.getElementById(
    "todayTaskText"
  ).textContent =
    `${remaining} tasks remaining`;

  if (todayTaskItems.length === 0) {

    todayTasks.innerHTML = `
      <div class="empty-state">
        <div>🎉</div>
        <h3>You're all caught up!</h3>
        <p>No tasks scheduled for today.</p>
      </div>
    `;

    return;
  }

  todayTasks.innerHTML =
    todayTaskItems
      .slice(0, 5)
      .map(task => {

        const completed =
          task.status === "completed";

        return `
          <div
            class="task-row ${
              completed
                ? "completed-task"
                : ""
            }"
          >

            <button
              class="task-check ${
                completed
                  ? "completed"
                  : ""
              }"
              onclick="toggleTodayTask(${task.id})"
            >
              ${completed ? "✓" : ""}
            </button>

            <div class="task-row-info">

              <strong>
                ${escapeHTML(task.title)}
              </strong>

              <small>
                ${formatDate(task.date)}
              </small>

            </div>

            <span class="priority ${task.priority}">
              ${capitalize(task.priority)}
            </span>

          </div>
        `;

      })
      .join("");

}


/* =========================================
   TODAY TASK TOGGLE
========================================= */

function toggleTodayTask(id) {

  const task =
    tasks.find(
      task => task.id === id
    );

  if (!task) return;

  task.status =
    task.status === "completed"
      ? "todo"
      : "completed";

  saveTasks();

  renderAll();

}


/* =========================================
   DASHBOARD STATS
========================================= */

function updateStats() {

  const total =
    tasks.length;

  const completed =
    tasks.filter(
      task => task.status === "completed"
    ).length;

  const productivity =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  document.getElementById(
    "totalTasks"
  ).textContent = total;

  document.getElementById(
    "completedTasks"
  ).textContent = completed;

  document.getElementById(
    "productivity"
  ).textContent =
    productivity + "%";

  document.getElementById(
    "analyticsCompleted"
  ).textContent = completed;

}


/* =========================================
   SEARCH
========================================= */

const globalSearch =
  document.getElementById(
    "globalSearch"
  );

globalSearch.addEventListener(
  "input",
  event => {

    const query =
      event.target.value
        .toLowerCase()
        .trim();

    if (!query) {

      renderKanban();

      return;

    }

    showPage("tasks");

    const results =
      tasks.filter(task =>
        task.title
          .toLowerCase()
          .includes(query)
        ||
        task.description
          .toLowerCase()
          .includes(query)
      );

    todoColumn.innerHTML = "";
    progressColumn.innerHTML = "";
    completedColumn.innerHTML = "";

    results.forEach(task => {

      const html =
        taskHTML(task);

      if (task.status === "todo")
        todoColumn.insertAdjacentHTML(
          "beforeend",
          html
        );

      if (task.status === "progress")
        progressColumn.insertAdjacentHTML(
          "beforeend",
          html
        );

      if (task.status === "completed")
        completedColumn.insertAdjacentHTML(
          "beforeend",
          html
        );

    });

    setupDragAndDrop();

  }
);


/* =========================================
   KEYBOARD SEARCH
========================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      globalSearch.focus();

    }

    if (
      event.key === "Escape" &&
      taskModal.classList.contains("open")
    ) {

      closeTaskModal();

    }

  }
);


/* =========================================
   DARK MODE
========================================= */

function applyTheme(theme) {

  if (theme === "dark") {

    document.documentElement
      .setAttribute(
        "data-theme",
        "dark"
      );

    document.getElementById(
      "themeBtn"
    ).textContent = "☀";

  } else {

    document.documentElement
      .removeAttribute(
        "data-theme"
      );

    document.getElementById(
      "themeBtn"
    ).textContent = "☾";

  }

  localStorage.setItem(
    THEME_KEY,
    theme
  );

}


const savedTheme =
  localStorage.getItem(
    THEME_KEY
  ) || "light";

applyTheme(savedTheme);


document
  .getElementById("themeBtn")
  ?.addEventListener(
    "click",
    () => {

      const current =
        localStorage.getItem(
          THEME_KEY
        ) || "light";

      applyTheme(
        current === "light"
          ? "dark"
          : "light"
      );

    }
  );


/* =========================================
   NOTIFICATIONS
========================================= */

document
  .getElementById("notificationBtn")
  ?.addEventListener(
    "click",
    () => {

      showToast(
        "Notifications",
        "You have 3 new productivity updates."
      );

    }
  );


/* =========================================
   OTHER BUTTONS
========================================= */

document
  .getElementById("upgradeBtn")
  ?.addEventListener(
    "click",
    () => {

      showToast(
        "Coming Soon",
        "Premium workspace features are coming soon."
      );

    }
  );


document
  .getElementById("logoutBtn")
  ?.addEventListener(
    "click",
    () => {

      showToast(
        "Demo Mode",
        "Logout is disabled in this portfolio demo."
      );

    }
  );


document
  .getElementById("newProjectBtn")
  ?.addEventListener(
    "click",
    () => {

      showToast(
        "Coming Soon",
        "Project creation will be added next."
      );

    }
  );


document
  .getElementById("saveProfile")
  ?.addEventListener(
    "click",
    () => {

      showToast(
        "Profile Saved",
        "Your profile changes were saved."
      );

    }
  );


document
  .getElementById("chartPeriod")
  ?.addEventListener(
    "change",
    () => {

      showToast(
        "Chart Updated",
        "Productivity chart period changed."
      );

    }
  );


/* =========================================
   CALENDAR
========================================= */

let calendarDate =
  new Date(2026, 8, 1);


function renderCalendar() {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  document.getElementById(
    "calendarTitle"
  ).textContent =
    `${monthNames[month]} ${year}`;

  const grid =
    document.getElementById(
      "calendarGrid"
    );

  grid.innerHTML = "";

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const previousMonthDays =
    new Date(
      year,
      month,
      0
    ).getDate();

  for (
    let i = firstDay - 1;
    i >= 0;
    i--
  ) {

    const day =
      previousMonthDays - i;

    grid.insertAdjacentHTML(
      "beforeend",
      `
        <div class="calendar-day other">
          <span class="calendar-number">
            ${day}
          </span>
        </div>
      `
    );

  }


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const dateString =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayTasks =
      tasks.filter(
        task =>
          task.date === dateString
      );

    const isToday =
      dateString === "2026-09-11";

    grid.insertAdjacentHTML(
      "beforeend",
      `
        <div class="calendar-day ${
          isToday ? "today" : ""
        }">

          <span class="calendar-number">
            ${day}
          </span>

          ${
            dayTasks
              .slice(0, 2)
              .map(
                task =>
                  `<div class="calendar-event">
                    ${escapeHTML(task.title)}
                  </div>`
              )
              .join("")
          }

        </div>
      `
    );

  }

}


document
  .getElementById("prevMonth")
  ?.addEventListener(
    "click",
    () => {

      calendarDate.setMonth(
        calendarDate.getMonth() - 1
      );

      renderCalendar();

    }
  );


document
  .getElementById("nextMonth")
  ?.addEventListener(
    "click",
    () => {

      calendarDate.setMonth(
        calendarDate.getMonth() + 1
      );

      renderCalendar();

    }
  );


/* =========================================
   TOAST
========================================= */

let toastTimer;

function showToast(
  title,
  message
) {

  const toast =
    document.getElementById("toast");

  document.getElementById(
    "toastTitle"
  ).textContent = title;

  document.getElementById(
    "toastMessage"
  ).textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 3000);

}


/* =========================================
   HELPERS
========================================= */

function capitalize(value) {

  return value.charAt(0).toUpperCase()
    + value.slice(1);

}


function statusLabel(status) {

  const labels = {
    todo: "To Do",
    progress: "In Progress",
    completed: "Completed"
  };

  return labels[status] || status;

}


function formatDate(dateString) {

  if (!dateString)
    return "No date";

  const date =
    new Date(
      dateString + "T00:00:00"
    );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric"
    }
  );

}


function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================
   RENDER EVERYTHING
========================================= */

function renderAll() {

  renderKanban();

  renderTodayTasks();

  updateStats();

  renderCalendar();

}


/* =========================================
   START APPLICATION
========================================= */

renderAll();

console.log(
  "NEXUS Dashboard loaded successfully 🚀"
);