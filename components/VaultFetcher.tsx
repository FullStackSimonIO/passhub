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

  useEffect(() => {
    const fetchAndDecryptVault = async () => {
      try {
        setLoading(true);
        setError(null);

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

        const stretchedMasterKey = sessionStorage.getItem("stretchedMasterKey");
        if (!stretchedMasterKey) {
          throw new Error("Stretched Master Key not found in sessionStorage");
        }

        const decryptedData = await decryptData(
          JSON.stringify(encryptedData),
          stretchedMasterKey
        );

        console.log("Decrypted vault data:", decryptedData);

        const parsedVault = JSON.parse(decryptedData);
        setDecryptedVault(parsedVault.items || []);
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
