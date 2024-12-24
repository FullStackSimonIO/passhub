"use client";

import { useEffect, useState } from "react";
import { decryptData } from "@/lib/crypto";

export default function VaultFetcher() {
  const [decryptedVault, setDecryptedVault] = useState<
    { id: string; name: string; username: string; password: string }[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndDecryptVault = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lese den JWT-Token
        const cookies = document.cookie.split("; ").reduce(
          (acc, cookie) => {
            const [name, value] = cookie.split("=");
            acc[name] = value;
            return acc;
          },
          {} as Record<string, string>
        );

        const jwtToken = cookies["token"];
        if (!jwtToken) {
          throw new Error("JWT token not found in cookies");
        }

        // 2. Fetch-Request an den Server
        const response = await fetch(
          "https://backend-rspass.let-net.cc/api/v1/sync/fetch",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        const encryptedData = JSON.parse(data.encrypted_data);

        if (!encryptedData.iv || !encryptedData.data) {
          throw new Error("Invalid encrypted data format");
        }

        // 3. Entschlüsselung
        const stretchedMasterKey = sessionStorage.getItem("stretchedMasterKey");
        if (!stretchedMasterKey) {
          throw new Error("Stretched Master Key not found in sessionStorage");
        }

        const decryptedData = await decryptData(
          JSON.stringify(encryptedData),
          stretchedMasterKey
        );

        console.log("Decrypted vault data:", decryptedData);

        // 4. Parsen und alle Einträge speichern
        const parsedVault = JSON.parse(decryptedData);
        setDecryptedVault(parsedVault.items || []); // Stelle sicher, dass ein Array gespeichert wird
      } catch (err) {
        console.error("Error fetching or decrypting vault:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecryptVault();
  }, []);

  // 5. Render-Logik
  if (loading) return <p>Loading vault data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <section className="flex flex-col items-center justify-center w-full h-screen">
      <h1 className="text-xl font-bold mb-4">Decrypted Vault</h1>
      {decryptedVault && decryptedVault.length > 0 ? (
        <div className="w-3/4">
          {decryptedVault.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg shadow mb-4 bg-gray-50"
            >
              <p>
                <strong>Name:</strong> {item.name}
              </p>
              <p>
                <strong>Username:</strong> {item.username}
              </p>
              <p>
                <strong>Password:</strong> {item.password}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No vault entries found.</p>
      )}
    </section>
  );
}
