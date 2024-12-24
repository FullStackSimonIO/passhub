"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { generateMasterKey, generateMasterPasswordHash } from "@/lib/crypto";
import { BellRing, UserPlus } from "lucide-react";

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

type CardProps = React.ComponentProps<typeof Card>;

export function RegisterCard({ className, ...props }: CardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const masterKey = await generateMasterKey(email, password);
      const masterPasswordHash = await generateMasterPasswordHash(
        masterKey,
        password
      );

      const payload = {
        email,
        password_hash: masterPasswordHash,
      };

      const response = await registerUser(payload);
      setMessage(`User registered successfully! Token: ${response.token}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
