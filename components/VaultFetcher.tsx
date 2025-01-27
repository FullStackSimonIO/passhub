"use client";

import { useEffect, useState } from "react";
import { decryptData } from "@/lib/crypto";

import { Loader2, Lock, User, Key } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VaultItem, VaultItemSchema } from "@/types/vaultItem";

export default function VaultFetcher() {
  const [decryptedVault, setDecryptedVault] = useState<VaultItem[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  // Helper function for authenticated API requests
  const fetchWithAuth = async (url: string) => {
    try {
      const jwtToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!jwtToken) {
        throw new Error("JWT token not found in cookies");
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        document.cookie = "token=; Max-Age=0; path=/"; // Delete JWT token
        window.location.href = "/login"; // Redirect to login
        return null;
      }

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in fetchWithAuth:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAndDecryptVault = async () => {
      try {
        setLoading(true);

        // Fetch encrypted data from the server
        const data = await fetchWithAuth(
          "https://backend-rspass.let-net.cc/api/v1/sync/fetch"
        );
        console.log("Raw API response:", data);

        if (!data || typeof data.encrypted_data !== "string") {
          throw new Error(
            "Invalid data format or missing encrypted_data property"
          );
        }

        // Parse encrypted data
        const encryptedData =
          typeof data.encrypted_data === "string"
            ? JSON.parse(data.encrypted_data)
            : data.encrypted_data;

        console.log("Parsed Encrypted Data:", encryptedData);

        if (!encryptedData.iv || !encryptedData.data) {
          throw new Error("Invalid encrypted data format: Missing iv or data");
        }

        // Retrieve stretched master key from session storage
        const stretchedMasterKey = sessionStorage.getItem("stretchedMasterKey");
        if (!stretchedMasterKey) {
          throw new Error("Stretched Master Key not found in sessionStorage");
        }
        console.log("Retrieved Stretched Master Key:", stretchedMasterKey);

        // Decrypt the vault data
        try {
          const decryptedData = await decryptData(
            JSON.stringify(encryptedData),
            stretchedMasterKey
          );
          console.log("Decrypted Data:", decryptedData);

          // Parse the decrypted JSON data
          const parsedVault = JSON.parse(decryptedData);

          // Validate decrypted data with Zod
          const validatedVault = VaultItemSchema.array().parse(parsedVault);
          console.log("Validated Vault:", validatedVault);

          setDecryptedVault(validatedVault);
        } catch (decryptionError) {
          console.error("Decryption failed:", decryptionError);
          throw new Error("Failed to decrypt vault data");
        }
      } catch (err) {
        console.error("Error fetching or decrypting vault:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecryptVault();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium">
            Loading vault data...
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Lock className="mr-2" /> Decrypted Vault
        </CardTitle>
      </CardHeader>
      <CardContent>
        {decryptedVault && decryptedVault.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-16rem)] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decryptedVault.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="flex items-center w-fit"
                      >
                        <User className="h-3 w-3 mr-1" />
                        {item.username}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center w-fit"
                      >
                        <Key className="h-3 w-3 mr-1" />
                        {item.password}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <Alert>
            <AlertTitle>No entries found</AlertTitle>
            <AlertDescription>Your vault is currently empty.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
