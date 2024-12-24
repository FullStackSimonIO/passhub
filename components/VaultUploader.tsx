"use client";

import { useState } from "react";
import { encryptData } from "@/lib/crypto";
import { updateVault } from "@/lib/api";
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
        items: [{ id: Date.now().toString(), name, username, password }],
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
