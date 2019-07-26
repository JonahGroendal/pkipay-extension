export async function encrypt(plaintext, password) {
  const keyDerivationParams = {
    name: "PBKDF2",
    salt: new Uint32Array(10),
    iterations: 1000000,
    hash: "SHA-256"
  };
  const encryptionParams = {
    name: "AES-GCM",
    iv: new Uint32Array(12)
  };
  window.crypto.getRandomValues(keyDerivationParams.salt);
  window.crypto.getRandomValues(encryptionParams.iv);

  let ciphertext = await window.crypto.subtle.encrypt(
    encryptionParams,
    await window.crypto.subtle.deriveKey(
      keyDerivationParams,
      await getKeyMaterial(password),
      { "name": "AES-GCM", "length": 256 },
      true,
      [ "encrypt", "decrypt" ]
    ),
    (new TextEncoder()).encode(plaintext)
  );
  const ciphertextObj = {
    keyDerivationParams,
    encryptionParams,
    ciphertext
  };
  // Convert ArrayBuffers to Arrays so they can be stringified
  ciphertextObj.ciphertext = Array.from(new Uint8Array(ciphertextObj.ciphertext))
  ciphertextObj.keyDerivationParams.salt = Array.from(ciphertextObj.keyDerivationParams.salt);
  ciphertextObj.encryptionParams.iv = Array.from(ciphertextObj.encryptionParams.iv);
  return ciphertextObj
}

export async function decrypt(ciphertextObj, password) {
  // Convert Arrays back to ArrayBuffers
  ciphertextObj.ciphertext = (Uint8Array.from(ciphertextObj.ciphertext)).buffer
  ciphertextObj.keyDerivationParams.salt = Uint32Array.from(ciphertextObj.keyDerivationParams.salt)
  ciphertextObj.encryptionParams.iv = Uint32Array.from(ciphertextObj.encryptionParams.iv)

  const buf = await window.crypto.subtle.decrypt(
    ciphertextObj.encryptionParams,
    await window.crypto.subtle.deriveKey(
      ciphertextObj.keyDerivationParams,
      await getKeyMaterial(password),
      { "name": "AES-GCM", "length": 256 },
      true,
      [ "encrypt", "decrypt" ]
    ),
    ciphertextObj.ciphertext
  );

  return (new TextDecoder("utf-8")).decode(buf);
}

async function getKeyMaterial(password) {
  return await window.crypto.subtle.importKey(
    "raw",
    (new TextEncoder()).encode(password),
    {name: "PBKDF2"},
    false,
    ["deriveBits", "deriveKey"]
  );
}
