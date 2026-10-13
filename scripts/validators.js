
export const TITLE_PATTERN =
    /^(?=.{3,120}$)[\p{L}\p{N}][\p{L}\p{N}\s.,:;!?()'’&+/#_-]*$/u;

export const TAG_PATTERN =
    /^[\p{L}\p{N}]+(?:[ _-][\p{L}\p{N}]+)*$/u;

export const MAX_TASKS = 500;
export const MAX_DURATION = 1440;

export function validateTitle(value) {
    const title = String(value ?? "").trim();

    if (title.length < 3 || title.length > 120) {
        return "Title must contain 3–120 characters.";
    }

    if (!TITLE_PATTERN.test(title)) {
        return "Title contains unsupported characters.";
    }

    return "";
}

export function validateDate(value) {
    const date = String(value ?? "");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return "Enter a date in YYYY-MM-DD format.";
    }

    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
        year < 1900 ||
        year > 9999 ||
        parsed.getUTCFullYear() !== year ||
        parsed.getUTCMonth() !== month - 1 ||
        parsed.getUTCDate() !== day
    ) {
        return "Enter a real calendar date.";
    }

    return "";
}

export function validateDuration(value) {
    const duration = Number(value);

    if (
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > MAX_DURATION
    ) {
        return "Duration must be a whole number from 1 to 1440 minutes.";
    }

    return "";
}

export function validateTag(value) {
    const tag = String(value ?? "").trim();

    if (tag.length < 2 || tag.length > 40) {
        return "Tag must contain 2–40 characters.";
    }

    if (!TAG_PATTERN.test(tag)) {
        return "Use letters or numbers separated by spaces, hyphens or underscores.";
    }

    return "";
}

export function validatePlannerItem(item) {
    const errors = {};

    const titleError = validateTitle(item.title);
    const dateError = validateDate(item.dueDate ?? item.date);
    const durationError = validateDuration(item.duration);
    const tagError = validateTag(item.tag);

    if (titleError) errors.title = titleError;
    if (dateError) errors.dueDate = dateError;
    if (durationError) errors.duration = durationError;
    if (tagError) errors.tag = tagError;

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

export function validateRegexPattern(pattern) {
    const source = String(pattern ?? "");

    if (source.length > 100) {
        return { valid: false, error: "Regex is limited to 100 characters." };
    }

    // Reject common patterns that can cause excessive backtracking.
    if (
        /\([^)]*[+*][^)]*\)[+*{]/.test(source) ||
        /(?:\.\*){2,}/.test(source)
    ) {
        return {
            valid: false,
            error: "This regex pattern is too risky. Simplify it."
        };
    }

    try {
        new RegExp(source, "iu");
        return { valid: true, error: "" };
    } catch {
        return { valid: false, error: "That regex pattern is not valid." };
    }
}