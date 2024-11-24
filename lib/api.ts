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

  // Send Request
  const response = await fetch(`${backendUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to register user");
  }

  const data = await response.json();
  return registerResponseSchema.parse(data);
};
