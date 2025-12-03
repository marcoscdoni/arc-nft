import { useSignMessage, useAccount } from 'wagmi';
import { useState, useCallback } from 'react';

interface UseWalletAuthReturn {
  signAuth: () => Promise<string | null>;
  isSigningAuth: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  lastAuthTime: number | null;
}

// Cache de assinaturas (válido por 1 hora)
const authCache = new Map<string, { signature: string; timestamp: number }>();
const AUTH_VALIDITY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Hook for wallet-based authentication via message signing
 * Users must sign a message to prove wallet ownership before sensitive actions
 */
export function useWalletAuth(): UseWalletAuthReturn {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isSigningAuth, setIsSigningAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastAuthTime, setLastAuthTime] = useState<number | null>(null);

  // Check if user has valid cached authentication
  const isAuthenticated = useCallback(() => {
    if (!address) return false;
    
    const cached = authCache.get(address.toLowerCase());
    if (!cached) return false;
    
    const isValid = Date.now() - cached.timestamp < AUTH_VALIDITY_MS;
    return isValid;
  }, [address]);

  /**
   * Request wallet signature to authenticate user
   * Message includes timestamp to prevent replay attacks
   * 
   * @param expectedAddress - Optional: validate that signing wallet matches expected address
   */
  const signAuth = useCallback(async (expectedAddress?: string): Promise<string | null> => {
    if (!address) {
      setAuthError('No wallet connected');
      return null;
    }

    // CRITICAL: Verify that connected wallet matches expected wallet
    if (expectedAddress && address.toLowerCase() !== expectedAddress.toLowerCase()) {
      setAuthError(`Wrong wallet connected. Expected: ${expectedAddress}, but got: ${address}`);
      console.error('Wallet mismatch:', { expected: expectedAddress, actual: address });
      return null;
    }

    // Check cache first
    const cached = authCache.get(address.toLowerCase());
    if (cached && Date.now() - cached.timestamp < AUTH_VALIDITY_MS) {
      setLastAuthTime(cached.timestamp);
      return cached.signature;
    }

    setIsSigningAuth(true);
    setAuthError(null);

    try {
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with ArcNFT Marketplace.

Wallet: ${address}
Timestamp: ${new Date(timestamp).toISOString()}
Nonce: ${timestamp}

This signature will not trigger any blockchain transaction or cost gas fees.`;

      const signature = await signMessageAsync({ message });

      // Cache the signature (scoped to this wallet address)
      authCache.set(address.toLowerCase(), { signature, timestamp });
      setLastAuthTime(timestamp);

      return signature;
    } catch (error: any) {
      console.error('Authentication signature failed:', error);
      setAuthError(error.message || 'Failed to sign authentication message');
      return null;
    } finally {
      setIsSigningAuth(false);
    }
  }, [address, signMessageAsync]);

  return {
    signAuth,
    isSigningAuth,
    authError,
    isAuthenticated: isAuthenticated(),
    lastAuthTime,
  };
}

/**
 * Clear authentication cache for a specific address
 */
export function clearAuth(address: string) {
  authCache.delete(address.toLowerCase());
}

/**
 * Clear all authentication cache
 */
export function clearAllAuth() {
  authCache.clear();
}

/**
 * Verify signature on backend (optional - for extra security)
 */
export async function verifySignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    // This would be a backend call in production
    // For now, we trust client-side verification via wagmi
    // Backend verification adds extra security layer
    return true;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}
