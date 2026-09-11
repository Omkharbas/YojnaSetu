const API_BASE = "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getDemoProfile() {
  const res = await fetch(`${API_BASE}/api/demo-profile`);
  return handle(res);
}

export async function analyzeProfile(profile) {
  const res = await fetch(`${API_BASE}/api/analyze-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("civicbenefit_token") ? { Authorization: `Bearer ${localStorage.getItem("civicbenefit_token")}` } : {}),
    },
    body: JSON.stringify({ profile }),
  });
  return handle(res);
}

export async function getSchemes(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  const res = await fetch(`${API_BASE}/api/schemes${query ? `?${query}` : ""}`);
  return handle(res);
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  return handle(res);
}

export const DOCUMENT_OPTIONS = [
  "Aadhaar",
  "PAN",
  "Income Certificate",
  "Caste Certificate",
  "Domicile Certificate",
  "Bank Account",
  "Ration Card",
  "Disability Certificate",
  "Land Records",
  "Birth Certificate",
  "Education Certificate",
];
