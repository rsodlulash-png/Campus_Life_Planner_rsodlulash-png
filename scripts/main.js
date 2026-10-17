
import {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getEvents,
    saveEvents,
    getSettings,
    saveSettings,
    getTags,
    saveTags,
    exportPlanner,
    importPlanner
} from "./storage.js";

import {
    validatePlannerItem,
    validateTitle,
    validateDate,
    validateDuration,
    validateTag
} from "./validators.js";

import { searchRecords, sortRecords } from "./search.js";

import {
    renderTasks,
    renderEvents,
    renderDashboard
} from "./ui.js";

let editingTaskId = null;
let editingEventId = null;

const $ = selector => document.querySelector(selector);

function announce(message, selector = "#task-form-message") {
    const element = $(selector);
    if (element) element.textContent = message;
}

function refreshTasks() {
    let tasks = getTasks();
    const query = $("#task-search")?.value ?? "";
    const filter = $("#task-filter")?.value ?? "all";
    const sortBy = $("#task-sort")?.value ?? "dueDate";
    const direction = $("#task-sort-direction")?.value ?? "asc";

    if (filter === "pending") {
        tasks = tasks.filter(task => !task.completed);
    } else if (filter === "completed") {
        tasks = tasks.filter(task => task.completed);
    }

    const result = searchRecords(tasks, query);

    if (result.error) {
        renderTasks([], { query: ""});
        announce(result.error, "#task-results-count");
        return;
    }

    renderTasks(sortRecords(result.results, sortBy, direction), { query });
}

function refreshEvents() {
    let events = getEvents();
    const query = $("#event-search")?.value ?? "";
    const filter = $("#event-filter")?.value ?? "all";

    if (filter !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        events = events.filter(event => {
            const date = new Date(`${event.dueDate ?? event.date}T00:00:00`);

            if (Number.isNaN(date.getTime())) return false;
            return filter === "upcoming" ? date >= today : date < today;
        });
    }

    const result = searchRecords(events, query);

    if (result.error) {
        announce(result.error, "#event-form-message");
        renderEvents([]);
        return;
    }

    renderEvents(sortRecords(result.results, "dueDate", "asc"));
}

function refreshDashboard() {
    renderDashboard(getTasks(), getEvents(), getSettings());
}

function refreshAll() {
    refreshTasks();
    refreshEvents();
    refreshDashboard();
}

function validateTaskForm(data) {
    const item = {
        title: data.get("title"),
        dueDate: data.get("date") || data.get("dueDate"),
        duration: Number(data.get("duration")),
        tag: data.get("tag")
    };

    const result = validatePlannerItem(item);

    const fieldIds = {
        title: "task-title",
        dueDate: "task-date",
        duration: "task-duration",
        tag: "task-tag"
    };

    document.querySelectorAll("[data-validation-error]").forEach(element => {
        element.remove();
    });

    Object.entries(fieldIds).forEach(([key, id]) => {
        const field = document.getElementById(id);
        if (field) field.removeAttribute("aria-invalid");
    });

    Object.entries(result.errors).forEach(([key, message]) => {
        const field = document.getElementById(fieldIds[key]);
        if (!field) return;

        field.setAttribute("aria-invalid", "true");

        const error = document.createElement("p");
        error.dataset.validationError = "true";
        error.className = "field-error";
        error.id = `${field.id}-error`;
        error.textContent = message;
        field.setAttribute("aria-describedby", error.id);
        field.insertAdjacentElement("afterend", error);
    });

    return result;
}

function handleTaskSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const validation = validateTaskForm(data);

    if (!validation.valid) {
        announce("Please correct the highlighted fields.");
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
    }

    const task = {
        title: String(data.get("title")).trim(),
        description: String(data.get("description") ?? "").trim(),
        dueDate: String(data.get("date") || data.get("dueDate")),
        duration: Number(data.get("duration")),
        category: String(data.get("category") || "Study"),
        tag: String(data.get("tag")).trim()
    };
    const wasEditing = Boolean(editingTaskId);
    let result;

    if (wasEditing) {
    result = updateTask(editingTaskId, task);
    } else {
    result = addTask(task);
    }

    announce(
    result.ok
        ? (wasEditing ? "Task updated." : "Task saved successfully.")
        : result.message
);

    

    // A successful update clears the edit state.
    if (result.ok) {
        editingTaskId = null;
        const submit = form.querySelector('[type="submit"]');
        if (submit) submit.textContent = "Save task";

        form.reset();
        refreshAll();
    }
}

function startEditingTask(id) {
    const task = getTasks().find(item => item.id === id);
    const form = $("#task-form");
    if (!task || !form) return;

    editingTaskId = task.id;

    form.elements.title.value = task.title;
    form.elements.description.value = task.description;
    form.elements.date.value = task.dueDate;
    form.elements.duration.value = task.duration;
    form.elements.category.value = task.category;
    form.elements.tag.value = task.tag;

    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.textContent = "Save changes";

    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.title.focus();

    announce(`Editing: ${task.title}`);
}

function handleTaskActions(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    if (!id) return;

    if (action === "edit") {
        startEditingTask(id);
    } else if (action === "delete") {
        const task = getTasks().find(item => item.id === id);
        if (!task) return;

        if (confirm(`Delete "${task.title}"? This cannot be undone.`)) {
            const ok = deleteTask(id);
            announce(ok ? "Task deleted." : "Could not delete the task.");
            refreshAll();
        }
    } else if (action === "toggle") {
        const task = getTasks().find(item => item.id === id);
        if (!task) return;

        const result = updateTask(id, { completed: !task.completed });
        announce(result.ok ? "Task status updated." : result.message);
        refreshAll();
    }
}

function handleEventSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const item = {
        title: String(data.get("title") ?? "").trim(),
        dueDate: String(data.get("date") || data.get("dueDate") || ""),
        duration: Number(data.get("duration") || 1),
        tag: String(data.get("tag") || "event")
    };

    const errors = {
        title: validateTitle(item.title),
        dueDate: validateDate(item.dueDate),
        duration: validateDuration(item.duration),
        tag: validateTag(item.tag)
    };

    const invalid = Object.values(errors).filter(Boolean);
    if (invalid.length) {
        announce(invalid.join(" "), "#event-form-message");
        return;
    }

    const events = getEvents();
    const eventRecord = {
        id: editingEventId || crypto.randomUUID(),
        title: item.title,
        dueDate: item.dueDate,
        date: item.dueDate,
        duration: item.duration,
        tag: item.tag,
        description: String(data.get("description") ?? "").trim(),
        location: String(data.get("location") ?? "").trim(),
        time: String(data.get("time") ?? ""),
        category: String(data.get("category") || "General")
    };

    const index = events.findIndex(saved => saved.id === editingEventId);

    if (index >= 0) {
        events[index] = eventRecord;
    } else {
        events.unshift(eventRecord);
    }

    const ok = saveEvents(events);

    if (ok) {
        editingEventId = null;
        form.reset();

        const submit = form.querySelector('[type="submit"]');
        if(submit) submit.textContent = "Save event";
        announce("Event saved successfully.", "#event-form-message");
        refreshAll();
    } else {
        announce("Could not save the event.", "#event-form-message");
    }
}

function handleEventActions(event) {
    const button = event.target.closest("button[data-event-action]");
    if (!button) return;

    const id = button.dataset.id;
    const events = getEvents();
    const index = events.findIndex(item => item.id === id);

    if (index < 0) return;

    if (button.dataset.eventAction === "delete") {
        if (confirm(`Delete "${events[index].title}"?`)) {
            events.splice(index, 1);
            saveEvents(events);
            refreshAll();
        }
    }

    if (button.dataset.eventAction === "edit") {
        const record = events[index];
        const form = $("#event-form");
        if (!form) {
            announce("Add an event form to timetable.html to edit events.", "#event-form-message");
            return;
        }

        editingEventId = record.id;
        form.elements.title.value = record.title;
        if (form.elements.description) form.elements.description.value = record.description || "";
        if (form.elements.location) form.elements.location.value = record.location || "";
        if (form.elements.date) form.elements.date.value = record.dueDate || record.date || "";
        if (form.elements.time) form.elements.time.value = record.time || "";
        if (form.elements.duration) form.elements.duration.value = record.duration || 1;
        if (form.elements.category) form.elements.category.value = record.category || "General";
        if (form.elements.tag) form.elements.tag.value = record.tag || "event";

        const submit = form.querySelector('[type="submit"]');
        if (submit) submit.textContent = "Save changes";

        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function setupSettings() {
    const form = $("#settings-form");

    if (form) {
        const settings = getSettings();

        for (const key of ["studyDuration", "breakDuration", "currency", "timeUnit"]) {
            if (form.elements[key]) form.elements[key].value = settings[key];
        }

        if (form.elements.targetMinutes) {
            form.elements.targetMinutes.value = settings.targetMinutes;
        }

        form.addEventListener("submit", event => {
            event.preventDefault();

            const data = new FormData(form);
            const updated = {
                studyDuration: Number(data.get("studyDuration")),
                breakDuration: Number(data.get("breakDuration")),
                targetMinutes: Number(data.get("targetMinutes") || 600),
                currency: data.get("currency") || "ZAR",
                timeUnit: data.get("timeUnit") || "minutes"
            };

            announce(
                saveSettings(updated)
                    ? "Settings saved."
                    : "Check your settings and try again.",
                "#settings-message"
            );

            refreshAll();
        });
    }

    const tagForm = $("#tag-form");
    if (tagForm) {
        tagForm.addEventListener("submit", event => {
            event.preventDefault();

            const input = tagForm.elements.tag;
            const tag = String(input?.value ?? "").trim();

            if (!validateTag(tag)) {
                const tags = getTags();
                if (!tags.some(saved => saved.toLowerCase() === tag.toLowerCase())) {
                    tags.push(tag);
                    saveTags(tags);
                    input.value = "";
                    renderSavedTags();
                }
            } else {
                announce(validateTag(tag), "#tag-form-message");
            }
        });
    }

    renderSavedTags();
}

function renderSavedTags() {
    const list = $("#saved-tags");
    if (!list) return;

    list.replaceChildren();

    getTags().forEach(tag => {
        const item = document.createElement("li");
        item.textContent = tag;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            saveTags(getTags().filter(saved => saved !== tag));
            renderSavedTags();
        });

        item.append(" ", remove);
        list.append(item);
    });
}

function setupImportExport() {
    $("#export-planner")?.addEventListener("click", () => {
        const backup = exportPlanner();
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "wits-campus-planner-backup.json";
        link.click();
        URL.revokeObjectURL(url);
    });

    $("#import-planner")?.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = JSON.parse(await file.text());

            if (!confirm("Importing a backup replaces your current saved planner data. Continue?")) {
                return;
            }

            const result = importPlanner(data);
            announce(result.message, "#settings-message");
            if (result.ok) refreshAll();
        } catch {
            announce("The selected file is not valid JSON.", "#settings-message");
        } finally {
            event.target.value = "";
        }
    });
}

function setupSearch() {
    $("#task-search-form")?.addEventListener("submit", event => {
        event.preventDefault();
        refreshTasks();
    });

    $("#task-search")?.addEventListener("input", refreshTasks);
    $("#task-filter")?.addEventListener("change", refreshTasks);
    $("#task-sort")?.addEventListener("change", refreshTasks);
    $("#task-sort-direction")?.addEventListener("change", refreshTasks);

    $("#clear-task-search")?.addEventListener("click", () => {
        if ($("#task-search")) $("#task-search").value = "";
        if ($("#task-filter")) $("#task-filter").value = "all";
        refreshTasks();
    });

    $("#event-search-form")?.addEventListener("submit", event => {
        event.preventDefault();
        refreshEvents();
    });

    $("#event-search")?.addEventListener("input", refreshEvents);
    $("#event-filter")?.addEventListener("change", refreshEvents);

    $("#clear-event-search")?.addEventListener("click", () => {
        if ($("#event-search")) $("#event-search").value = "";
        if ($("#event-filter")) $("#event-filter").value = "all";
        refreshEvents();
    });
}

function initialize() {
    $("#task-form")?.addEventListener("submit", handleTaskSubmit);
    $("#task-list")?.addEventListener("click", handleTaskActions);
    $("#event-form")?.addEventListener("submit", handleEventSubmit);
    $("#event-list")?.addEventListener("click", handleEventActions);

    setupSearch();
    setupSettings();
    setupImportExport();

    const urlQuery = new URLSearchParams(window.location.search).get("q");
    if (urlQuery && $("#task-search")) $("#task-search").value = urlQuery;
    refreshAll();

}

document.addEventListener("DOMContentLoaded", initialize);