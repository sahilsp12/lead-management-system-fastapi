/**
 * Parses axios error response details from FastAPI.
 * Safely handles both string detail messages (400, 401, etc.)
 * and array validation structures (Pydantic 422 errors).
 */
export const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  
  if (!detail) {
    return error.message || 'An unexpected error occurred.';
  }
  
  if (typeof detail === 'string') {
    return detail;
  }
  
  if (Array.isArray(detail)) {
    // Map list of validation errors into a single readable string
    return detail
      .map((errObj) => {
        const field = errObj.loc && errObj.loc.length > 0 
          ? errObj.loc[errObj.loc.length - 1] 
          : 'Field';
        return `${field}: ${errObj.msg}`;
      })
      .join(', ');
  }
  
  return typeof detail === 'object' ? JSON.stringify(detail) : String(detail);
};
