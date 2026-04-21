export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function roundScore(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function escapeRegExp(value = '') {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge(base = {}, override = {}) {
    const output = { ...base };

    for (const [key, value] of Object.entries(override || {})) {
    if (Array.isArray(value)) {
        output[key] = [...value];
        continue;
    }

    if (isPlainObject(value) && isPlainObject(base[key])) {
        output[key] = deepMerge(base[key], value);
        continue;
    }

    output[key] = value;
    }

    return output;
}

export function sortTokens(input) {
    return input
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ');
}

export function uniqueTokens(input) {
    return Array.from(new Set(input.split(/\s+/).filter(Boolean)));
}