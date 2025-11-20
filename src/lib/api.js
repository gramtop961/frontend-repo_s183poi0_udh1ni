export const API_BASE = import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(/\/$/, "");

async function http(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const api = {
  matches: (type = 'live') => http(`/api/matches?type=${type}`),
  match: (id) => http(`/api/match/${id}`),
  rankings: (format = 'odi') => http(`/api/rankings?format=${format}`),
  news: () => http(`/api/news`),
  trendingPlayers: () => http(`/api/trending-players`),
  tweets: (query) => http(`/api/tweets?query=${encodeURIComponent(query)}`),
};
