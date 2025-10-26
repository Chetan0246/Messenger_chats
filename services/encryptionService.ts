// This is a simple XOR cipher for demonstration purposes.
// It is NOT secure and should not be used for real encryption.
const ENCRYPTION_KEY = 'GEMINI_SECRET_KEY';

function xorCipher(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * "Encrypts" a string by applying an XOR cipher and then encoding it to Base64.
 * @param text The plaintext string to encrypt.
 * @returns A Base64 encoded string representing the encrypted data.
 */
export function encrypt(text: string): string {
    // FIX: Removed Node.js-specific Buffer logic as this is a client-side application.
    return window.btoa(xorCipher(text, ENCRYPTION_KEY));
}

/**
 * "Decrypts" a Base64 encoded string by first decoding it and then applying the same XOR cipher.
 * @param encryptedText The Base64 encoded string to decrypt.
 * @returns The original plaintext string.
 */
export function decrypt(encryptedText: string): string {
    // FIX: Removed Node.js-specific Buffer logic as this is a client-side application.
    try {
        const decoded = window.atob(encryptedText);
        return xorCipher(decoded, ENCRYPTION_KEY);
    } catch (e) {
        console.error("Failed to decrypt:", e);
        return "Decryption failed.";
    }
}
