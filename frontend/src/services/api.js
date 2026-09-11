const API_BASE = "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("civicbenefit_token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getDemoProfile() {
  return handle(
    await fetch(`${API_BASE}/api/demo-profile`)
  );
}

export async function getProfile() {
  return handle(
    await fetch(`${API_BASE}/api/profile`, {
      headers: authHeaders(),
    })
  );
}

export async function saveProfile(profile) {
  return handle(
    await fetch(`${API_BASE}/api/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(profile),
    })
  );
}

export async function analyzeProfile(profile) {
  return handle(
    await fetch(`${API_BASE}/api/analyze-profile`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ profile }),
    })
  );
}

export async function getSchemes(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== ""
    )
  ).toString();

  return handle(
    await fetch(
      `${API_BASE}/api/schemes${
        query ? `?${query}` : ""
      }`
    )
  );
}

export async function getCategories() {
  return handle(
    await fetch(`${API_BASE}/api/categories`)
  );
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

export async function chatWithAI(message, profile, analysis) {
  const res = await fetch(`${API_BASE}/api/ai-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("civicbenefit_token")
        ? {
            Authorization: `Bearer ${localStorage.getItem(
              "civicbenefit_token"
            )}`,
          }
        : {}),
    },
    body: JSON.stringify({
      message,
      profile,
      analysis,
    }),
  });

  return handle(res);
}