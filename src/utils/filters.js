/**
 * Data filtering utilities
 */

/**
 * Filter array by search term across multiple fields
 * @param {Array} items 
 * @param {string} searchTerm 
 * @param {Array} searchFields 
 * @returns {Array}
 */
export function filterBySearch(items, searchTerm, searchFields) {
  if (!searchTerm || searchTerm.trim() === '') return items;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return items.filter(item => {
    return searchFields.some(field => {
      const value = getNestedProperty(item, field);
      return value && value.toString().toLowerCase().includes(lowerSearchTerm);
    });
  });
}

/**
 * Get nested property from object using dot notation
 * @param {Object} obj 
 * @param {string} path 
 * @returns {any}
 */
function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Filter employees by company, job role, and department
 * @param {Array} employees 
 * @param {Object} filters 
 * @returns {Array}
 */
export function filterEmployees(employees, filters) {
  const { company, jobRole, department } = filters;

  return employees.filter((employee) => {
    if (company && !employee.company_name?.toLowerCase().includes(company.toLowerCase())) {
      return false;
    }
    if (jobRole && !employee.job_title?.toLowerCase().includes(jobRole.toLowerCase())) {
      return false;
    }
    if (department && !employee.department_name?.toLowerCase().includes(department.toLowerCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Paginate array
 * @param {Array} items 
 * @param {number} page 
 * @param {number} itemsPerPage 
 * @returns {Object} { items, totalPages, startIndex, endIndex }
 */
export function paginate(items, page, itemsPerPage) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalPages,
    startIndex,
    endIndex: Math.min(endIndex, items.length),
    totalItems: items.length,
  };
}

/**
 * Sort array by field
 * @param {Array} items 
 * @param {string} field 
 * @param {string} order 
 * @returns {Array}
 */
export function sortBy(items, field, order = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = getNestedProperty(a, field);
    const bVal = getNestedProperty(b, field);

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

