import { healthResponseSchema, HealthResponse } from "@/types/health";
import { RegisterPayload, registerResponseSchema } from "@/types/auth";
import { generateMasterKey, generateMasterPasswordHash } from "@/lib/crypto";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// API Abruflogik
export const fetchHealthStatus = async (): Promise<HealthResponse> => {
  const response = await fetch("/api/health");

  if (!response.ok) {
    throw new Error("Failed to fetch health status");
  }

  const data = await response.json();

  return healthResponseSchema.parse(data);
};

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
