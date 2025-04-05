// utils/errorHandler.js (Create this file if you don't have a utils folder)

/**
 * Handles errors from API calls or other operations within Express routes.
 * Logs the error and sends an appropriate HTTP response.
 *
 * @param {Error} error The error object caught.
 * @param {Response} res The Express response object.
 * @param {string} [context='An error occurred'] A message describing the context where the error happened (for logging).
 */
const handleApiError = (error, res, context = 'An error occurred') => {
    // Log the error details for debugging
    console.error(
        `${context}:`,
        error.response?.status || 'No Status Code', // Log HTTP status if available
        JSON.stringify(error.response?.data, null, 2) || error.message || error // Log response data or error message
    );

    // Handle specific HTTP status codes from error responses (like Axios errors)
    if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        const graphErrorMessage = responseData?.error?.message; // Try to get specific Graph API error

        switch (status) {
            case 400:
                return res.status(400).json({
                    error: graphErrorMessage || "Bad Request",
                    details: responseData // Include details if available
                });
            case 401:
                return res.status(401).json({ error: graphErrorMessage || "Unauthorized" });
            case 403:
                return res.status(403).json({ error: graphErrorMessage || "Forbidden" });
            case 404:
                return res.status(404).json({ error: graphErrorMessage || "Not Found" });
            // Add other common status codes as needed (e.g., 409 Conflict)
            // case 409:
            //     return res.status(409).json({ error: graphErrorMessage || "Conflict" });
            default:
                // Fall through to generic 500 for other client/server errors from the external API
                break;
        }
    }

    // Generic fallback for network errors or unhandled cases
    res.status(500).json({ error: "An internal server error occurred" });
};

module.exports = handleApiError; // Export the function