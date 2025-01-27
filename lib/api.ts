import {
  generateMasterKey,
  generateMasterPasswordHash,
  updateVault,
  VaultItem,
} from "@/lib/crypto";
import { registerResponseSchema, RegisterPayload } from "@/types/auth";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// API Abruflogik

//! Registrierung
export const registerUser = async (payload: RegisterPayload) => {
  try {
    const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const responseText = await response.text();

    if (!responseText) {
      throw new Error(`Empty response from server. Status: ${response.status}`);
    }

    const data = JSON.parse(responseText);

    return registerResponseSchema.parse(data);
  } catch (error) {
    console.log("Error during API call:", error);
    throw error;
  }
};

// ! Login
export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Starting login process for email:", email);

    // Schritt 1: Master Key generieren
    const masterKey = await generateMasterKey(email, password);
    console.log("Generated Master Key:", masterKey);

    // Schritt 2: Master Password Hash generieren
    const masterPasswordHash = await generateMasterPasswordHash(
      masterKey,
      password
    );
    console.log("Generated Master Password Hash:", masterPasswordHash);

    // Schritt 3: Daten an den Server senden
    const payload = {
      email,
      password_hash: masterPasswordHash,
    };
    console.log("Login Payload:", payload);

    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response Text:", errorText);
      throw new Error(`Login failed with status: ${response.status}`);
    }

    // Schritt 4: Token aus der Antwort extrahieren
    const data = await response.json();
    console.log("Login response:", data);
    return data.token; // JWT-Token
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// ! update vault

export async function handleAddNewItem(newItem: VaultItem) {
  const masterKey = sessionStorage.getItem("masterKey");
  const jwtToken = document.cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!jwtToken) {
    console.error("JWT token not found in cookies");
    return;
  }

  if (!masterKey || !jwtToken) {
    console.error("Missing authentication data");
    return;
  }

  const fetchUrl = "https://backend-rspass.let-net.cc/api/v1/sync/fetch";
  const updateUrl = "https://backend-rspass.let-net.cc/api/v1/sync/update";

  await updateVault(newItem, masterKey, fetchUrl, updateUrl, jwtToken);
}

// ! Fetch Vault
export async function fetchWithAuth(
  url: string,
  options: { headers?: HeadersInit } = {}
) {
  const jwtToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!jwtToken) {
    console.error("JWT token not found in cookies");
    // Optional: Benutzer automatisch zur Login-Seite leiten
    logout();
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    console.error("Unauthorized! Redirecting to login...");
    logout();
    return null;
  }

  return response.json();
}

// * Logout with Cookie
export function logout() {
  document.cookie = "token=; Max-Age=0; path=/"; // JWT-Token löschen
  window.location.href = "/login"; // Zur Login-Seite weiterleiten
}
