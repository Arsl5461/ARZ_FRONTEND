import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

/**
 * Format a date to a specified format.
 *
 * @param {string | Date} date - The input date string or Date object to format.
 * @param {string} [newFormat] - The format to apply (default is 'MM/dd/yyyy').
 * @returns {string} The formatted date string or 'N/A' if input is invalid.
 * 
 * Author: Ali Haider
 * Date: 19 sep, 2023
 */
export function formatDate(date, newFormat) {
    if (!date || Number.isNaN(Number(new Date(date)))) {
        return 'N/A';
    }

    const fm = newFormat || 'MM/dd/yyyy';

    return date ? format(new Date(date), fm) : '';
}

/**
 * Format a date and time to a specified format.
 *
 * @param {string | Date} date - The input date string or Date object to format.
 * @param {string} [newFormat] - The format to apply (default is 'dd MMM yyyy p').
 * @returns {string} The formatted date and time string.
 * 
 * Author: Ali Haider
 * Date: 19 sep, 2023
 */
export function formatDateTime(date, newFormat) {
    const fm = newFormat || 'dd MMM yyyy p';

    return date ? format(new Date(date), fm) : '';
}

/**
 * Get the timestamp of a date.
 *
 * @param {string | Date} date - The input date string or Date object.
 * @returns {number} The timestamp of the date.
 * 
 * Author: Ali Haider
 * Date: 19 sep, 2023
 */
export function formatTimestamp(date) {
    return date ? getTime(new Date(date)) : '';
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago").
 *
 * @param {string | Date} date - The input date string or Date object to format.
 * @returns {string} The relative time string.
 * 
 * Author: Ali Haider
 * Date: 19 sep, 2023
 */
export function formatToNow(date) {
    return date
        ? formatDistanceToNow(new Date(date), {
              addSuffix: true,
          })
        : '';
}
