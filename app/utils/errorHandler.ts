// Error handling utility for consistent API responses
export const handleApiError = (error: any): { message: string; details?: string; status: number } => {
  if (error.response) {
    // API returned error response
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      return {
        message: 'Session expired. Please login again.',
        status: 401,
      };
    }

    if (status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        status: 403,
      };
    }

    if (status === 404) {
      return {
        message: data.message || 'Resource not found.',
        status: 404,
      };
    }

    if (status === 409) {
      return {
        message: data.message || 'Conflict: Unable to complete this action.',
        status: 409,
      };
    }

    if (status === 422) {
      // Validation error
      const errors = data.errors || {};
      const firstError = Object.values(errors)[0];
      return {
        message: 'Validation failed.',
        details: Array.isArray(firstError) ? firstError[0] : (firstError as string),
        status: 422,
      };
    }

    if (status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        details: data.message,
        status,
      };
    }

    return {
      message: data.message || 'An error occurred.',
      details: data.details,
      status,
    };
  }

  if (error.request && !error.response) {
    // Request made but no response
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  }

  // Error in setup
  return {
    message: 'An unexpected error occurred.',
    details: error.message,
    status: 0,
  };
};

// Toast error helper
export const showErrorToast = (error: any, toast: any) => {
  const { message, details } = handleApiError(error);
  toast(details ? `${message} ${details}` : message, 'error');
};
