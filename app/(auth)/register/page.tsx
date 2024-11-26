"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { generateMasterKey, generateMasterPasswordHash } from "@/lib/crypto";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Schritt 1: Master Key generieren
      const masterKey = await generateMasterKey(email, password);

      // Schritt 2: Master Password Hash generieren
      const masterPasswordHash = await generateMasterPasswordHash(
        masterKey,
        password
      );

      // Schritt 3: API-Payload erstellen
      const payload = {
        email, // Die E-Mail-Adresse des Nutzers
        password_hash: masterPasswordHash, // Der berechnete Hash
      };

      // Schritt 4: API-Aufruf zur Registrierung
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
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
