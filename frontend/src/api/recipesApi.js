const BASE_URL = "http://localhost:8000/api";

/**
 * Fetch paginated recipes sorted by rating (for browsing/trending).
 */
export async function fetchRecipes(page = 1, limit = 10) {
    const response = await fetch(
        `${BASE_URL}/recipes?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch recipes");
    return response.json(); // { page, limit, total, data: [...] }
}

/**
 * Search recipes by title and optional filters.
 */
export async function searchRecipes(title, cuisine, rating, totalTime) {
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (cuisine) params.append("cuisine", cuisine);
    if (rating) params.append("rating", rating);
    if (totalTime) params.append("total_time", totalTime);

    const response = await fetch(
        `${BASE_URL}/recipes/search?${params.toString()}`
    );
    if (!response.ok) throw new Error("Failed to search recipes");
    return response.json(); // returns plain array
}

/**
 * Extract unique cuisines from the full recipe list.
 */
export async function fetchCuisines() {
    const response = await fetch(`${BASE_URL}/recipes?page=1&limit=1000`);
    if (!response.ok) throw new Error("Failed to fetch cuisines");
    const result = await response.json();
    const cuisines = [...new Set(result.data.map((r) => r.cuisine))].sort();
    return cuisines;
}

/**
 * Send a message to CulBot Chatbot.
 */
export async function sendChatMessage(message) {
    const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error("CulBot is temporarily unavailable");
    return response.json();
}
