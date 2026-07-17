
export const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;
  
  if (!detail) {
    return error.message || 'An unexpected error occurred.';
  }
  
  if (typeof detail === 'string') {
    return detail;
  }
  
  if (Array.isArray(detail)) {
    
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
