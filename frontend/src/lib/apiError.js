export const getApiError = (error) => {
  if (!error.response) {
    return "Cannot connect to server. Please try again.";
  }

  const data = error.response.data;

  return (
    data?.message ||
    data?.errors?.[0]?.message ||
    "Something went wrong"
  );
};