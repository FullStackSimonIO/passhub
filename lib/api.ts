import { healthResponseSchema, HealthResponse } from "@/types/health";
import { RegisterPayload, registerResponseSchema } from "@/types/auth";

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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
    console.error("Error during API call:", error);
    throw error;
  }
};
