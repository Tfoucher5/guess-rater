import { rate } from './rate.js';

export function isMatch(leftInput, rightInput, thresholdOrOptions = {}, maybeOptions = {}) {
    let options;

    if (typeof thresholdOrOptions === 'number') {
        options = {
        ...maybeOptions,
        threshold: thresholdOrOptions
        };
    } else {
        options = thresholdOrOptions || {};
    }

    const result = rate(leftInput, rightInput, {
        ...options,
        explain: true
    });

    return result.match;
}