
import { highlightText, compileSearch } from "./search.js";

export function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function highlightedHTML(value, regex) {
    return highlightText(value, regex)
        .map(part => part.highlighted
            ? `<mark>${escapeHTML(part.text)}</mark>`
            : escapeHTML(part.text))
        .join("");
}

export function renderTasks(tasks, options = {}) {
    const container = document.querySelector("#task-list");
    const count = document.querySelector("#task-results-count");

    if (!container) return;

    const query = options.query ?? "";
    const compiled = compileSearch(query);
    const regex = compiled.ok ? compiled.regex : null;

    if (count) {
        count.textContent = `${tasks.length} task${tasks.length === 1 ? "" : "s"} found.`;
    }

    if (!tasks.length) {
        container.replaceChildren();
        const message = document.createElement("p");
        message.textContent = "No tasks found. Add a task or change your search.";
        container.append(message);
        return;
    }

    container.innerHTML = tasks.map(task => `
        <article class="planner-card task-card ${task.completed ? "is-completed" : ""}">
            <h3>${highlightedHTML(task.title, regex)}</h3>
            <p>${escapeHTML(task.description || "No description added.")}</p>
            <dl>
                <div>
                    <dt>Due date</dt>
                    <dd>${escapeHTML(task.dueDate)}</dd>
                </div>
                <div>
                    <dt>Duration</dt>
                    <dd>${escapeHTML(task.duration)} minutes</dd>
                </div>
                <div>
                    <dt>Category</dt>
                    <dd>${escapeHTML(task.category)}</dd>
                </div>
                <div>
                    <dt>Tag</dt>
                    <dd>${highlightedHTML(task.tag, regex)}</dd>
                </div>
                <div>
                    <dt>Status</dt>
                    <dd>${task.completed ? "Completed" : "Pending"}</dd>
                </div>
            </dl>
            <div class="task-actions">
                <button type="button" class="button button-blue"
                    data-action="toggle" data-id="${escapeHTML(task.id)}">
                    ${task.completed ? "Mark pending" : "Mark complete"}
                </button>
                <button type="button" class="edit-task-button"
                    data-action="edit" data-id="${escapeHTML(task.id)}">
                    Edit
                </button>
                <button type="button" class="delete-task-button"
                    data-action="delete" data-id="${escapeHTML(task.id)}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}

export function renderEvents(events) {
    const container = document.querySelector("#event-list");
    if (!container) return;

    if (!events.length) {
        container.textContent = "No events found. Add an event to get started.";
        return;
    }

    container.innerHTML = events.map(event => `
        <article class="planner-card">
            <h3>${escapeHTML(event.title)}</h3>
            <p>${escapeHTML(event.description || event.location || "")}</p>
            <p><strong>Date:</strong> ${escapeHTML(event.dueDate ?? event.date)}</p>
            <p><strong>Time:</strong> ${escapeHTML(event.time || "Not set")}</p>
            <p><strong>Category:</strong> ${escapeHTML(event.category || "General")}</p>
            <div class="task-actions">
                <button type="button" class="edit-task-button"
                    data-event-action="edit" data-id="${escapeHTML(event.id)}">
                    Edit
                </button>
                <button type="button" class="delete-task-button"
                    data-event-action="delete" data-id="${escapeHTML(event.id)}">
                    Delete
                </button>
            </div>
        </article>
    `).join("");
}

export function renderDashboard(tasks, events, settings) {
    const setText = (selector, value) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = String(value);
    };

    const completed = tasks.filter(task => task.completed);
    const pending = tasks.filter(task => !task.completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events.filter(event => {
        const date = new Date(`${event.dueDate ?? event.date}T00:00:00`);
        return !Number.isNaN(date.getTime()) && date >= today;
    });

    const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
    const progress = tasks.length
        ? Math.round((completed.length / tasks.length) * 100)
        : 0;

    setText("#dashboard-total-tasks", tasks.length);
    setText("#dashboard-completed-tasks", completed.length);
    setText("#dashboard-pending-tasks", pending.length);
    setText("#dashboard-upcoming-events", upcoming.length);
    setText("#dashboard-progress-label", `${progress}% complete`);
    setText("#dashboard-task-duration",
        settings.timeUnit === "hours"
            ? `${(totalMinutes / 60).toFixed(1)} hours`
            : `${totalMinutes} minutes`
    );

    const progressElement = document.querySelector("#dashboard-progress");
    if (progressElement) {
        if (progressElement instanceof HTMLProgressElement) {
            progressElement.max = 100;
            progressElement.value = progress;
        } else {
            progressElement.style.width = `${progress}%`;
            progressElement.setAttribute("role", "progressbar");
            progressElement.setAttribute("aria-valuemin", "0");
            progressElement.setAttribute("aria-valuemax", "100");
            progressElement.setAttribute("aria-valuenow", String(progress));
        }
    }

    const deadlines = document.querySelector("#dashboard-deadlines");
    if (deadlines) {
        deadlines.replaceChildren();

        [...pending]
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
            .slice(0, 5)
            .forEach(task => {
                const item = document.createElement("li");
                item.textContent = `${task.title} — due ${task.dueDate}`;
                deadlines.append(item);
            });

        if (!pending.length) {
            const item = document.createElement("li");
            item.textContent = "No pending deadlines.";
            deadlines.append(item);
        }
    }

    const target = Number(settings.targetMinutes) || 600;
    setText("#dashboard-study-target",
        `${Math.min(100, Math.round((totalMinutes / target) * 100))}% of study-time target`
    );
}
