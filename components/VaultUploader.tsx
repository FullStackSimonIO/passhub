"use client";

import { useState } from "react";
import { decryptData, encryptData } from "@/lib/crypto";
import { Loader2, Lock, User, Key, FileText } from "lucide-react";

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
      console.log("Starting the submit process...");

      // Abrufen des Stretched Master Key
      const stretchedMasterKey = sessionStorage.getItem("stretchedMasterKey");
      if (!stretchedMasterKey) {
        throw new Error("Stretched Master Key not found in sessionStorage");
      }
      console.log("Stretched Master Key loaded:", stretchedMasterKey);

      // Abrufen des JWT-Tokens
      const jwtToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      if (!jwtToken) {
        throw new Error("JWT token not found in cookies");
      }
      console.log("JWT token found:", jwtToken);

      // Fetch bestehende Vault-Daten
      const fetchUrl = "https://backend-rspass.let-net.cc/api/v1/sync/fetch";
      console.log("Fetching existing vault data from:", fetchUrl);
      const fetchResponse = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!fetchResponse.ok) {
        console.error(
          "Failed to fetch existing vault data:",
          fetchResponse.status
        );
        throw new Error("Error fetching existing vault data");
      }

      const fetchData = await fetchResponse.json();
      console.log("Fetched encrypted vault data:", fetchData);

      // Entschlüsseln der bestehenden Vault-Daten
      const encryptedData = JSON.parse(fetchData.encrypted_data || "{}");
      let existingVault = [];

      if (encryptedData.iv) {
        try {
          console.log("Decrypting existing vault data...");
          const existingDecryptedData = await decryptData(
            JSON.stringify(encryptedData),
            stretchedMasterKey
          );
          console.log(
            "Decrypted existing vault data (raw):",
            existingDecryptedData
          );

          existingVault = JSON.parse(existingDecryptedData);
          console.log("Parsed existing vault:", existingVault);

          if (!Array.isArray(existingVault)) {
            throw new Error("Decrypted vault is not an array");
          }
        } catch (error) {
          console.error("Error decrypting or parsing vault data:", error);
          throw new Error("Failed to decrypt or parse existing vault data");
        }
      } else {
        console.log(
          "No existing encrypted data found. Initializing empty vault..."
        );
        existingVault = [];
      }

      // Neues Item hinzufügen
      const newItem = {
        id: Date.now().toString(),
        name,
        username,
        password,
      };
      console.log("New item to add:", newItem);

      const updatedVault = [...existingVault, newItem];
      console.log("Updated vault items:", updatedVault);

      // Verschlüsselung der aktualisierten Vault-Daten
      const encryptedVault = await encryptData(
        JSON.stringify(updatedVault),
        stretchedMasterKey
      );
      console.log("Encrypted updated vault data:", encryptedVault);

      // Aktualisierte Daten an den Server senden
      const updateUrl = "https://backend-rspass.let-net.cc/api/v1/sync/update";
      console.log("Sending updated vault data to:", updateUrl);
      const updateResponse = await fetch(updateUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ encrypted_data: encryptedVault }),
      });

      if (!updateResponse.ok) {
        console.error("Failed to update vault:", updateResponse.status);
        throw new Error("Error updating vault");
      }

      console.log("Vault successfully updated!");
      setMessage("Vault updated successfully!");
      setName("");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error during submit process:", error);
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
      console.log("Submit process completed.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Lock className="mr-2" /> Add to Vault
        </CardTitle>
        <CardDescription>
          Enter the details of the item you want to add to your vault.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Encrypting and Sending...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Add to Vault
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {message && (
          <Alert
            variant={message.includes("Error") ? "destructive" : "default"}
            className="w-full"
          >
            <AlertTitle>
              {message.includes("Error") ? "Error" : "Success"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
