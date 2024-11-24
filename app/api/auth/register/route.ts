import { z } from "zod";
import { NextResponse } from "next/server";

// ZOD Schema für Eingabedaten
const registerPayloadSchema = z.object({
  email: z.string().email("The Email must be a valid email address."),
  password_hash: z
    .string()
    .min(8, "The Password must be at least 8 characters long.")
    .max(50, "The Password must be at most 50 characters long."),
});

// ZOD Schema für Antwortdaten
const registerResponseSchema = z.object({
  token: z.string(),
});

// API-Handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validateData = registerPayloadSchema.parse(body);

    const token = `generated-token-for-${validateData.email}`; // ! Hier sollte ein JWT-Token generiert werden

    const response = { token };
    return (
      NextResponse.json(registerResponseSchema.parse(response)), { status: 200 }
    );
  } catch (error) {
    // check if ZOD validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
  }

  // casual error
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
