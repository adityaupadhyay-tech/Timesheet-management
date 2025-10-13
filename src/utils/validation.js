/**
 * Form validation utilities
 */

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required field
 * @param {string} value 
 * @returns {boolean}
 */
export function isRequired(value) {
  return value && value.trim().length > 0;
}

/**
 * Validate phone number format
 * @param {string} phone 
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  // Basic phone validation - adjust regex based on requirements
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return !phone || phoneRegex.test(phone);
}

/**
 * Validate employee form data
 * @param {Object} formData 
 * @returns {Object} errors object
 */
export function validateEmployeeForm(formData) {
  const errors = {};

  if (!isRequired(formData.firstName)) {
    errors.firstName = 'First name is required';
  }

  if (!isRequired(formData.lastName)) {
    errors.lastName = 'Last name is required';
  }

  if (!isRequired(formData.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return errors;
}

/**
 * Validate employee assignments
 * @param {Array} assignments 
 * @returns {Object} validation result
 */
export function validateEmployeeAssignments(assignments) {
  const validAssignments = assignments.filter(
    (assignment) =>
      assignment.companyId && assignment.jobRoleId && assignment.locationId
  );

  if (validAssignments.length === 0) {
    return {
      isValid: false,
      error: 'At least one valid assignment is required'
    };
  }

  return { isValid: true, error: null };
}

