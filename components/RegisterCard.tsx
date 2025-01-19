"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct useRouter import for App Router
import { registerUser } from "@/lib/api";
import { generateMasterKey, generateMasterPasswordHash } from "@/lib/crypto";
import { BellRing, Eye, EyeOff, UserPlus } from "lucide-react";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Password requirements
const passwordRequirements = [
  {
    regex: /.{12,}/, // Minimum 12 characters
    label: "At least 12 characters",
  },
  {
    regex: /[A-Z]/, // At least one uppercase letter
    label: "At least one uppercase letter",
  },
  {
    regex: /\d/, // At least one number
    label: "At least one number",
  },
  {
    regex: /[@$!%*?&]/, // At least one special character
    label: "At least one special character (@, $, !, %, *, ?, &)",
  },
];

// Zod schema for validation
const RegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must include at least one special character (@, $, !, %, *, ?, &)"
    ),
});

type CardProps = React.ComponentProps<typeof Card>;

export function RegisterCard({ className, ...props }: CardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Correctly use useRouter inside the component

  // Calculate password strength
  const strength = passwordRequirements.filter((req) =>
    req.regex.test(password)
  ).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate the input using Zod
      RegistrationSchema.parse({ email, password });

      const masterKey = await generateMasterKey(email, password);
      const masterPasswordHash = await generateMasterPasswordHash(
        masterKey,
        password
      );

      const payload = {
        email,
        password_hash: masterPasswordHash,
      };

      const response = await registerUser(payload); // Register user and get response
      if (response?.token) {
        // Set token in cookies
        document.cookie = `token=${response.token}; path=/;`;

        // Redirect to the dashboard
        router.push("/dashboard");
      } else {
        throw new Error("Registration successful but no token returned.");
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        setMessage(error.errors.map((err) => err.message).join("\n"));
      } else if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex justify-center items-center h-screen">
      <Card className={cn("w-[380px]", className)} {...props}>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your new account here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // Toggle between "text" and "password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                  className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {/* Password Strength Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className={`h-2 rounded ${
                      strength === passwordRequirements.length
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${(strength / passwordRequirements.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <ul className="mt-2 text-sm">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={`${
                        req.regex.test(password)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <BellRing className="mr-2 h-4 w-4 animate-spin" />
                  Registering
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          {message && (
            <Alert
              variant={message.includes("Error") ? "destructive" : "default"}
            >
              <AlertTitle>
                {message.includes("Error") ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </section>
  );
}
