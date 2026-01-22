import { connect as puzzleConnect, disconnect as puzzleDisconnect, getAccount, requestSignature, Network } from "@puzzlehq/sdk-core";
import { ALEO_CONFIG } from "./aleo";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
  isVerified: boolean;
}

export const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  network: null,
  isLoading: false,
  error: null,
  isVerified: false,
};

export function hasPuzzleWallet(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { aleo?: { puzzleWalletClient?: unknown } })?.aleo?.puzzleWalletClient;
}

export async function connectWallet(): Promise<{ address: string; network: string }> {
  if (!hasPuzzleWallet()) {
    throw new Error("Puzzle Wallet not detected. Please install the extension.");
  }

  const response = await puzzleConnect({
    dAppInfo: {
      name: "TimeVault",
      description: "Private time-locked message vault powered by Aleo",
      iconUrl: typeof window !== "undefined" ? `${window.location.origin}/icon.svg` : "",
    },
    network: Network.AleoTestnet,
    permissions: {
      programIds: {
        [Network.AleoTestnet]: [
          ALEO_CONFIG.vaultProgramId,
          ALEO_CONFIG.subscriptionProgramId,
        ],
        [Network.AleoMainnet]: [
          ALEO_CONFIG.vaultProgramId,
          ALEO_CONFIG.subscriptionProgramId,
        ],
      },
    },
  });

  if (!response?.connection?.address) {
    throw new Error("Failed to connect wallet");
  }

  return {
    address: response.connection.address,
    network: response.connection.network,
  };
}

export async function requestWalletSignature(message: string): Promise<string> {
  if (!hasPuzzleWallet()) {
    throw new Error("Wallet not connected");
  }

  try {
    const response = await requestSignature({ message });
    if (!response?.signature) {
      throw new Error("Signature rejected");
    }
    return response.signature;
  } catch {
    throw new Error("Signature request failed or was rejected");
  }
}

export async function disconnectWallet(): Promise<void> {
  await puzzleDisconnect();
}

export async function getCurrentAccount(): Promise<{ address: string; network: string } | null> {
  try {
    const account = await getAccount();
    if (account?.address) {
      return {
        address: account.address,
        network: account.network,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getMappingValue(programId: string, mappingName: string, key: string): Promise<string | null> {
  try {
    const { getMappingValue: puzzleGetMappingValue } = await import("@puzzlehq/sdk-core");
    const value = await puzzleGetMappingValue({
      programId,
      mappingName,
      key,
      network: Network.AleoTestnet,
    });
    return value || null;
  } catch (error) {
    console.error(`Error fetching mapping ${mappingName}:`, error);
    return null;
  }
}

export async function executeTransaction(
  programId: string,
  functionName: string,
  inputs: string[]
): Promise<string> {
  if (!hasPuzzleWallet()) {
    throw new Error("Wallet not connected");
  }

  const { requestCreateEvent } = await import("@puzzlehq/sdk-core");
  
  console.log("Executing transaction:", {
    programId,
    functionName,
    inputs,
  });
  
  try {
    const response = await requestCreateEvent({
      type: "Execute",
      programId,
      functionId: functionName,
      fee: 3.5,
      inputs,
    });

    console.log("Transaction response:", response);

    if (response?.error) {
      throw new Error(response.error);
    }

    if (!response?.eventId) {
      throw new Error("Transaction was rejected or failed. Please check your wallet and try again.");
    }

    return response.eventId;
  } catch (error) {
    console.error("Transaction error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Transaction failed. Please check your wallet has enough credits.");
  }
}

export function generateAuthMessage(address: string): string {
  const timestamp = Date.now();
  return `TimeVault Authentication\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nSign this message to verify ownership of your wallet.`;
}

export function storeAuthSession(address: string, signature: string): void {
  if (typeof window === "undefined") return;
  const session = {
    address,
    signature,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem("timevault_auth", JSON.stringify(session));
}

export function getAuthSession(): { address: string; signature: string; expiresAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("timevault_auth");
    if (!stored) return null;
    const session = JSON.parse(stored);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem("timevault_auth");
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("timevault_auth");
}
