/**
 * Formatting utilities for dates, currency, and other data
 */

/**
 * Format date to local string
 * @param {Date|string} date 
 * @param {Object} options 
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatted = dateObj.toLocaleDateString('en-US', defaultOptions);
  
  // If no custom options, ensure MM/dd/yyyy format
  if (Object.keys(options).length === 0) {
    const [month, day, year] = formatted.split('/');
    return `${month}/${day}/${year}`;
  }
  
  return formatted;
}

/**
 * Format time duration from minutes to HH:MM format
 * @param {number} minutes 
 * @returns {string}
 */
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Parse HH:MM format to minutes
 * @param {string} hhmm 
 * @returns {number}
 */
export function parseDuration(hhmm) {
  if (!hhmm || hhmm === '') return 0;
  const [hours, minutes] = hhmm.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

/**
 * Format minutes to hours with decimal
 * @param {number} minutes 
 * @param {number} decimals 
 * @returns {string}
 */
export function minutesToHours(minutes, decimals = 1) {
  return (minutes / 60).toFixed(decimals);
}

/**
 * Format currency
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format full name from first and last name
 * @param {string} firstName 
 * @param {string} lastName 
 * @returns {string}
 */
export function formatFullName(firstName, lastName) {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Get initials from name
 * @param {string} name 
 * @returns {string}
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

