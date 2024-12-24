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

// * Generate Stretched Master Key
export async function generateStretchedMasterKey(
  masterKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  const salt = encoder.encode("bitwarden_stretching_salt"); // Optionales Salt
  const masterKeyBuffer = Uint8Array.from(atob(masterKey), (c) =>
    c.charCodeAt(0)
  );

  // Importiere den Master Key
  const importedKey = await crypto.subtle.importKey(
    "raw",
    masterKeyBuffer,
    { name: "HKDF" },
    false,
    ["deriveKey"]
  );

  // Erstelle den Stretched Master Key
  const stretchedKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt,
      info: encoder.encode("bitwarden_encryption"), // Info-String zur zusätzlichen Sicherheit
    },
    importedKey,
    { name: "AES-GCM", length: 256 }, // Ziel: AES-256-GCM-Schlüssel
    true,
    ["encrypt", "decrypt"]
  );

  // Exportiere den Schlüssel als ArrayBuffer
  const stretchedKeyBuffer = await crypto.subtle.exportKey("raw", stretchedKey);

  // Konvertiere den ArrayBuffer in Base64
  const stretchedKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(stretchedKeyBuffer))
  );

  return stretchedKeyBase64;
}

// * Generate Master Password Hash
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
export async function encryptData(
  data: string,
  stretchedMasterKey: string
): Promise<string> {
  // 1. Initialisierungsvektor (IV) generieren
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 Bytes für AES-GCM

  // 2. Schlüssel importieren
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(stretchedMasterKey), (c) => c.charCodeAt(0)), // Base64 zu Uint8Array
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // 3. Daten verschlüsseln
  const encoder = new TextEncoder();
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );

  // 4. Ergebnis serialisieren (Base64-kodierte Daten und IV)
  return JSON.stringify({
    iv: btoa(String.fromCharCode(...iv)), // IV in Base64
    data: btoa(String.fromCharCode(...new Uint8Array(encryptedData))), // Verschlüsselte Daten in Base64
  });
}

export async function decryptData(
  encryptedData: string,
  stretchedMasterKey: string
): Promise<string> {
  console.log("Decrypting data...");
  const { iv, data } = JSON.parse(encryptedData);

  console.log("IV (Base64):", iv);
  console.log("Encrypted Data (Base64):", data);

  // Base64-Dekodierung
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const encryptedBuffer = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));

  console.log("IV (Uint8Array):", ivBuffer);
  console.log("Encrypted Data (Uint8Array):", encryptedBuffer);

  // Stretched Master Key dekodieren
  const keyBuffer = Uint8Array.from(atob(stretchedMasterKey), (c) =>
    c.charCodeAt(0)
  );

  console.log("Key Buffer:", keyBuffer);

  // Importiere den Schlüssel für die Entschlüsselung
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  console.log("Imported Key for Decryption:", key);

  // Entschlüsselung
  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer },
      key,
      encryptedBuffer
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    console.log("Decrypted Text:", decryptedText);

    return decryptedText;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

// * AES-2 GCM Encryption
export async function encryptVault(
  vaultData: object,
  masterKey: string
): Promise<string> {
  // 1. Generiere den Stretched Master Key
  const stretchedKey = await generateStretchedMasterKey(masterKey);
  console.log("Stretched Master Key:", stretchedKey);

  // 2. Verschlüssele die Vault-Daten
  const encryptedVault = await encryptData(
    JSON.stringify(vaultData),
    stretchedKey
  );
  console.log("Encrypted Vault:", encryptedVault);

  return encryptedVault;
}

// * AES-2 GCM Decryption
export async function decryptVault(
  encryptedVault: string,
  masterKey: string
): Promise<object> {
  // 1. Generiere den Stretched Master Key
  const stretchedKey = await generateStretchedMasterKey(masterKey);
  console.log("Stretched Master Key:", stretchedKey);

  // 2. Entschlüssele die Vault-Daten
  const decryptedVault = await decryptData(encryptedVault, stretchedKey);
  console.log("Decrypted Vault:", decryptedVault);

  return JSON.parse(decryptedVault);
}
