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

interface VaultItem {
  id: string;
  name: string;
  username: string;
  password: string;
}

export default function VaultFetcher() {
  const [decryptedVault, setDecryptedVault] = useState<VaultItem[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapper-Funktion für API-Aufrufe mit Authentifizierung
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
        // Token ungültig oder abgelaufen, Benutzer ausloggen
        console.error("Unauthorized! Redirecting to login...");
        document.cookie = "token=; Max-Age=0; path=/"; // JWT-Token löschen
        window.location.href = "/login"; // Zur Login-Seite weiterleiten
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
        setError(null);

        const data = await fetchWithAuth(
          "https://backend-rspass.let-net.cc/api/v1/sync/fetch"
        );

        if (!data || !data.encrypted_data) {
          throw new Error("Invalid data received from API");
        }

        console.log("Fetched data:", data);

        const encryptedData = JSON.parse(data.encrypted_data);
        console.log("Encrypted Data:", encryptedData);

        if (!encryptedData.iv || !encryptedData.data) {
          throw new Error("Invalid encrypted data format");
        }

        const stretchedMasterKey = sessionStorage.getItem("stretchedMasterKey");
        if (!stretchedMasterKey) {
          throw new Error("Stretched Master Key not found in sessionStorage");
        }

        const decryptedData = await decryptData(
          JSON.stringify(encryptedData),
          stretchedMasterKey
        );

        console.log("Decrypted Data:", decryptedData);

        const parsedVault = JSON.parse(decryptedData);
        console.log("Parsed Vault:", parsedVault);

        if (!Array.isArray(parsedVault)) {
          throw new Error("Decrypted vault data is not an array");
        }

        setDecryptedVault(parsedVault);
      } catch (err) {
        console.error("Error fetching or decrypting vault:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
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

  if (error) {
    return (
      <Alert variant="destructive" className="w-full max-w-3xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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
