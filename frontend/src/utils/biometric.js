// Biometric Authentication Utility using Web Authentication API

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async () => {
    try {
        // Check if PublicKeyCredential is available
        if (!window.PublicKeyCredential) {
            return false;
        }

        // Check if platform authenticator is available (fingerprint, face ID, etc.)
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch (error) {
        console.error('Error checking biometric availability:', error);
        return false;
    }
};

/**
 * Register biometric credentials for the user
 */
export const registerBiometric = async (userId, userName) => {
    try {
        const available = await isBiometricAvailable();
        if (!available) {
            throw new Error('Biometric authentication is not available on this device');
        }

        // Generate a challenge (in production, this should come from your server)
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Create credential options
        const publicKeyCredentialCreationOptions = {
            challenge: challenge,
            rp: {
                name: "Hishab Kitab",
                id: window.location.hostname,
            },
            user: {
                id: new TextEncoder().encode(userId.toString()),
                name: userName,
                displayName: userName,
            },
            pubKeyCredParams: [
                {
                    type: "public-key",
                    alg: -7, // ES256
                },
                {
                    type: "public-key",
                    alg: -257, // RS256
                }
            ],
            authenticatorSelection: {
                authenticatorAttachment: "platform", // Use platform authenticator (fingerprint, face ID)
                userVerification: "required",
                requireResidentKey: false,
            },
            timeout: 60000,
            attestation: "none",
        };

        // Create the credential
        const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions,
        });

        if (!credential) {
            throw new Error('Failed to create biometric credential');
        }

        // Store credential ID in localStorage
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem('biometricCredentialId', credentialId);

        return {
            success: true,
            credentialId: credentialId,
        };
    } catch (error) {
        console.error('Biometric registration error:', error);

        // Handle specific errors
        if (error.name === 'NotAllowedError') {
            throw new Error('Biometric registration was cancelled or not allowed');
        } else if (error.name === 'NotSupportedError') {
            throw new Error('Biometric authentication is not supported on this device');
        } else if (error.name === 'InvalidStateError') {
            throw new Error('Biometric credentials already exist for this device');
        }

        throw error;
    }
};

/**
 * Authenticate using biometric credentials
 */
export const authenticateBiometric = async () => {
    try {
        const available = await isBiometricAvailable();
        if (!available) {
            throw new Error('Biometric authentication is not available on this device');
        }

        const credentialId = localStorage.getItem('biometricCredentialId');
        if (!credentialId) {
            throw new Error('No biometric credentials found. Please enable fingerprint login first.');
        }

        // Generate a challenge
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Convert credential ID back to ArrayBuffer
        const credentialIdBuffer = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));

        // Create assertion options
        const publicKeyCredentialRequestOptions = {
            challenge: challenge,
            allowCredentials: [
                {
                    id: credentialIdBuffer,
                    type: "public-key",
                    transports: ["internal"],
                }
            ],
            userVerification: "required",
            timeout: 60000,
        };

        // Get the assertion (authenticate)
        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions,
        });

        if (!assertion) {
            throw new Error('Biometric authentication failed');
        }

        return {
            success: true,
            assertion: assertion,
        };
    } catch (error) {
        console.error('Biometric authentication error:', error);

        // Handle specific errors
        if (error.name === 'NotAllowedError') {
            throw new Error('Biometric authentication was cancelled or failed');
        } else if (error.name === 'NotSupportedError') {
            throw new Error('Biometric authentication is not supported on this device');
        }

        throw error;
    }
};

/**
 * Remove biometric credentials
 */
export const removeBiometric = () => {
    localStorage.removeItem('biometricCredentialId');
    localStorage.removeItem('biometricEnabled');
};
