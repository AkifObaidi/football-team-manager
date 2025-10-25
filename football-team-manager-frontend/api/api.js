const BASE_URL = "http://localhost:8080/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

export const loginOrSignup = async (email, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const getCurrentUser = async () => {
    const res = await fetch(`${BASE_URL}/`, { headers: getHeaders() });
    return res.json();
};

export const getMarketPlayers = async (filters = {}, mine = false) => {
    const params = new URLSearchParams({ ...filters });
    if (mine) params.append("mine", "true");
    const res = await fetch(`${BASE_URL}/${mine ? "my-listings" : "market"}?${params}`, { headers: getHeaders() });
    return res.json();
};

export const listPlayerForSale = async (playerId, price) => {
    const res = await fetch(`${BASE_URL}/list-player`, {
        method: "POST",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, asking_price: price }),
    });
    return res.json();
};

export const removeListing = async (playerId) => {
    const res = await fetch(`${BASE_URL}/remove-listing`, {
        method: "POST",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
    });
    return res.json();
};

export const buyPlayer = async (playerId) => {
    const res = await fetch(`${BASE_URL}/buy-player`, {
        method: "POST",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
    });
    return res.json();
};
