
import { validateRegexPattern } from "./validators.js";

export function compileSearch(query) {
    const text = String(query ?? "").trim();

    if (!text) {
        return { ok: true, regex: null, tag: null, error: "" };
    }

    // Example: @tag:python
    const tagMatch = text.match(/^@tag:(\w+)$/i);

    if (tagMatch) {
        return {
            ok: true,
            regex: null,
            tag: tagMatch[1].toLowerCase(),
            error: ""
        };
    }

    // A query surrounded by /slashes/ is treated as a regex.
    const slashMatch = text.match(/^\/(.+)\/([iu]*)$/);

    if (slashMatch) {
        const pattern = slashMatch[1];
        const validation = validateRegexPattern(pattern);

        if (!validation.valid) {
            return {
                ok: false,
                regex: null,
                tag: null,
                error: validation.error
            };
        }

        try {
            return {
                ok: true,
                regex: new RegExp(pattern, [...new Set(slashMatch[2] + "i")].join("")),
                tag: null,
                error: ""
            };
        } catch {
            return {
                ok: false,
                regex: null,
                tag: null,
                error: "Invalid search pattern."
            };
        }
    }

    // Plain text is escaped, so punctuation is not interpreted as regex.
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return {
        ok: true,
        regex: new RegExp(escaped, "i"),
        tag: null,
        error: ""
    };
}

export function searchRecords(records, query) {
    const compiled = compileSearch(query);

    if (!compiled.ok) {
        return { results: [], error: compiled.error };
    }

    const results = records.filter(record => {
        if (compiled.tag) {
            return String(record.tag ?? "")
                .toLowerCase()
                .split(/[\s_-]+/)
                .includes(compiled.tag);
        }

        if (!compiled.regex) return true;

        const searchable = [
            record.title,
            record.description,
            record.dueDate ?? record.date,
            record.duration,
            record.tag,
            record.category,
            record.location,
            record.time
        ].join(" ");

        // Avoid stateful matches if a regex ever uses a global flag.
        compiled.regex.lastIndex = 0;
        return compiled.regex.test(searchable);
    });

    return { results, error: "" };
}

export function sortRecords(records, sortBy = "dueDate", direction = "asc") {
    const multiplier = direction === "desc" ? -1 : 1;

    return [...records].sort((a, b) => {
        const first = a[sortBy] ?? "";
        const second = b[sortBy] ?? "";

        if (typeof first === "number" && typeof second === "number") {
            return (first - second) * multiplier;
        }

        return String(first).localeCompare(String(second)) * multiplier;
    });
}

export function highlightText(text, regex) {
    const value = String(text ?? "");

    if (!regex) {
        return [{ text: value, highlighted: false }];
    }

    // Do not accept global or sticky flags for splitting.
    const safeRegex = new RegExp(regex.source, "i");
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = safeRegex.exec(value)) !== null) {
        if (match[0].length === 0) break;

        if (match.index > lastIndex) {
            parts.push({
                text: value.slice(lastIndex, match.index),
                highlighted: false
            });
        }

        parts.push({ text: match[0], highlighted: true });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
        parts.push({ text: value.slice(lastIndex), highlighted: false });
    }

    return parts.length ? parts : [{ text: value, highlighted: false }];
}
