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

export const registerUser = async (payload: RegisterPayload) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const response = await fetch(`${backendUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Prüfe, ob die Antwort leer ist
  const responseText = await response.text();
  if (!responseText) {
    throw new Error(`Empty response from server. Status: ${response.status}`);
  }

  try {
    const data = JSON.parse(responseText);
    return registerResponseSchema.parse(data);
  } catch {
    throw new Error("Failed to parse JSON response");
  }
};
