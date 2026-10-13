
import { validatePlannerItem, MAX_TASKS } from "./validators.js";

const KEYS = {
    tasks: "witsPlanner.tasks.v1",
    events: "witsPlanner.events.v1",
    settings: "witsPlanner.settings.v1",
    tags: "witsPlanner.tags.v1"
};

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;

        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

function normalizeTask(task) {
    return {
        id: String(task.id || crypto.randomUUID()),
        title: String(task.title ?? "").trim(),
        description: String(task.description ?? "").trim(),
        dueDate: String(task.dueDate ?? task.date ?? ""),
        duration: Number(task.duration),
        category: String(task.category ?? "Study"),
        tag: String(task.tag ?? "").trim(),
        completed: Boolean(task.completed),
        createdAt: task.createdAt || new Date().toISOString()
    };
}

function validTask(task) {
    const normalized = normalizeTask(task);
    return validatePlannerItem(normalized).valid;
}

export function getTasks() {
    const tasks = readJSON(KEYS.tasks, []);
    if (!Array.isArray(tasks)) return [];

    return tasks
        .filter(validTask)
        .slice(0, MAX_TASKS)
        .map(normalizeTask);
}

export function saveTasks(tasks) {
    if (!Array.isArray(tasks) || tasks.length > MAX_TASKS) {
        return false;
    }

    const normalized = tasks.map(normalizeTask);

    if (!normalized.every(validTask)) return false;

    return writeJSON(KEYS.tasks, normalized);
}

export function addTask(task) {
    const tasks = getTasks();

    if (tasks.length >= MAX_TASKS) {
        return { ok: false, message: `You can save up to ${MAX_TASKS} tasks.` };
    }

    const normalized = normalizeTask(task);

    if (!validTask(normalized)) {
        return { ok: false, message: "Please check the task fields." };
    }

    tasks.unshift(normalized);

    if (!saveTasks(tasks)) {
        return { ok: false, message: "Could not save this task in your browser." };
    }

    return { ok: true, task: normalized };
}

export function updateTask(id, changes) {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task.id === String(id));

    if (index === -1) {
        return { ok: false, message: "Task not found." };
    }

    const updated = normalizeTask({ ...tasks[index], ...changes, id });

    if (!validTask(updated)) {
        return { ok: false, message: "Please check the task fields." };
    }

    tasks[index] = updated;

    if (!saveTasks(tasks)) {
        return { ok: false, message: "Could not save your changes." };
    }

    return { ok: true, task: updated };
}

export function deleteTask(id) {
    const tasks = getTasks();
    const remaining = tasks.filter(task => task.id !== String(id));

    if (remaining.length === tasks.length) return false;

    return saveTasks(remaining);
}

export function getEvents() {
    const events = readJSON(KEYS.events, []);
    return Array.isArray(events) ? events : [];
}

export function saveEvents(events) {
    return Array.isArray(events) && writeJSON(KEYS.events, events);
}

export function getSettings() {
    return readJSON(KEYS.settings, {
        studyDuration: 50,
        breakDuration: 10,
        currency: "ZAR",
        timeUnit: "minutes",
        targetMinutes: 600
    });
}

export function saveSettings(settings) {
    const studyDuration = Number(settings.studyDuration);
    const breakDuration = Number(settings.breakDuration);
    const targetMinutes = Number(settings.targetMinutes);

    if (
        !Number.isInteger(studyDuration) || studyDuration < 1 ||
        !Number.isInteger(breakDuration) || breakDuration < 1 ||
        !Number.isInteger(targetMinutes) || targetMinutes < 1
    ) {
        return false;
    }

    return writeJSON(KEYS.settings, {
        studyDuration,
        breakDuration,
        targetMinutes,
        currency: ["ZAR", "RWF", "USD", "GBP", "EUR"].includes(settings.currency)
            ? settings.currency
            : "ZAR",
        timeUnit: settings.timeUnit === "hours" ? "hours" : "minutes"
    });
}

export function getTags() {
    const tags = readJSON(KEYS.tags, []);
    return Array.isArray(tags) ? tags.filter(tag => typeof tag === "string") : [];
}

export function saveTags(tags) {
    return Array.isArray(tags) && writeJSON(KEYS.tags, tags);
}

export function exportPlanner() {
    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks: getTasks(),
        events: getEvents(),
        settings: getSettings(),
        tags: getTags()
    };
}

export function importPlanner(data) {
    if (
        !data ||
        data.version !== 1 ||
        !Array.isArray(data.tasks) ||
        !Array.isArray(data.events) ||
        !data.settings ||
        !Array.isArray(data.tags)
    ) {
        return { ok: false, message: "The file is not a supported planner backup." };
    }

    if (data.tasks.length > MAX_TASKS || !data.tasks.every(validTask)) {
        return { ok: false, message: "The backup contains invalid tasks or exceeds the task limit." };
    }

    // Validate before writing anything.
    const tasks = data.tasks.map(normalizeTask);
    const settings = data.settings;
    const settingsOK =
        Number.isInteger(Number(settings.studyDuration)) &&
        Number(settings.studyDuration) > 0 &&
        Number.isInteger(Number(settings.breakDuration)) &&
        Number(settings.breakDuration) > 0 &&
        Number.isInteger(Number(settings.targetMinutes)) &&
        Number(settings.targetMinutes) > 0;

    if (!settingsOK || !data.events.every(event =>
        event && typeof event.title === "string" &&
        typeof (event.dueDate ?? event.date) === "string"
    )) {
        return { ok: false, message: "The backup contains invalid settings or events." };
    }

    const ok =
        saveTasks(tasks) &&
        saveEvents(data.events) &&
        saveSettings(settings) &&
        saveTags(data.tags);

    return ok
        ? { ok: true, message: "Planner backup imported successfully." }
        : { ok: false, message: "Could not save the backup. Check browser storage." };
}
