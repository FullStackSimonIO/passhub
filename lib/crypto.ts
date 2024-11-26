// * Generate Master Key
export async function generateMasterKey(
  email: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(email); // Die E-Mail-Adresse wird als Salt genutzt.
  const passwordKey = encoder.encode(password); // Passwort als Uint8Array.

  // Importiere das Passwort als Key für PBKDF2
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordKey,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Führe PBKDF2 durch, um den Master Key zu erzeugen
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000, // Anzahl der Iterationen (anpassbar je nach Sicherheitsanforderung)
      hash: "SHA-256", // Hash-Algorithmus
    },
    baseKey,
    256 // Länge des Outputs in Bits (256 = 32 Bytes)
  );

  // Gib den Master Key als Base64-String zurück
  return btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
}

export async function generateMasterPasswordHash(
  masterKey: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(password); // Das Passwort dient hier als Salt.
  const masterKeyBuffer = Uint8Array.from(atob(masterKey), (c) =>
    c.charCodeAt(0)
  );

  // Importiere den Master Key
  const baseKey = await crypto.subtle.importKey(
    "raw",
    masterKeyBuffer,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Führe PBKDF2 durch, um den Master Password Hash zu erzeugen
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    256
  );

  // Gib den Master Password Hash als Base64-String zurück
  return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
}
