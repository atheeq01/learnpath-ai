export function getApiError(error) {
  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }
  if (!error.response) {
    return "Cannot connect to the server. Check your connection and try again.";
  }
  return (
    error.response.data?.message ||
    error.response.data?.errors?.[0]?.message ||
    "Something went wrong. Please try again."
  );
}
