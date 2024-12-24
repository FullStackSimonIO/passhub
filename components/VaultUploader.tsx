"use client";

import { useState } from "react";
import { encryptData } from "@/lib/crypto"; // Deine Verschlüsselungslogik
import { updateVault } from "@/lib/api"; // POST-Request-Funktion

export default function VaultUploader() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      console.log("Fetching stretchedMasterKey from sessionStorage...");
      const stretchedMasterKey = sessionStorage.getItem("stretchedMasterKey");
      if (!stretchedMasterKey)
        throw new Error("Stretched Master Key not found");

      console.log("Stretched Master Key loaded:", stretchedMasterKey);

      const jwtToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!jwtToken) throw new Error("JWT token not found in cookies");

      console.log("JWT token found:", jwtToken);

      const vaultData = {
        items: [
          { id: Date.now().toString(), name, username, password }, // Neue Daten
        ],
      };

      console.log("Vault data to encrypt:", vaultData);

      const encryptedVault = await encryptData(
        JSON.stringify(vaultData),
        stretchedMasterKey
      );

      console.log("Encrypted Vault Data:", encryptedVault);

      await updateVault(jwtToken, encryptedVault);

      setMessage("Vault updated successfully!");
      setName("");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error updating vault:", error);
      setMessage("Error: Failed to update vault.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Encrypting and Sending..." : "Add to Vault"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
