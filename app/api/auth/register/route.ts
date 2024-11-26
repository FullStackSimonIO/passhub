import { z } from "zod";
import { NextResponse } from "next/server";

// ZOD Schema für Eingabedaten
const registerPayloadSchema = z.object({
  email: z.string().email("The Email must be a valid email address."),
  password_hash: z
    .string()
    .min(12, "The Password must be at least 12 characters long.")
    .max(50, "The Password must be at most 50 characters long."),
});

// ZOD Schema für Antwortdaten
const registerResponseSchema = z.object({
  token: z.string(),
});

// API-Handler
export async function POST(req: Request) {
  console.log("POST request received at /api/v1/auth/register");

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const validateData = registerPayloadSchema.parse(body);
    console.log("Validation passed:", validateData);

    const token = `generated-token-for-${validateData.email}`;
    const response = { token };

    console.log("Generated token response:", response);
    return NextResponse.json(registerResponseSchema.parse(response), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error details:", error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Unhandled server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
