export const ALEO_CONFIG = {
  network: "AleoTestnet" as const,
  rpcUrl: process.env.NEXT_PUBLIC_ALEO_RPC_URL || "https://api.explorer.provable.com/v2",
  vaultProgramId: process.env.NEXT_PUBLIC_PROGRAM_ID || "timevault_main_9482.aleo",
  subscriptionProgramId: process.env.NEXT_PUBLIC_SUBSCRIPTION_PROGRAM_ID || "timevault_subscription_9483.aleo",
};

export const VAULT_TYPES = {
  MESSAGE: 0,
  FILE: 1,
  NOTE: 2,
} as const;

export const UNLOCK_TYPES = {
  DATE_TIME: 0,
  AGE_BASED: 1,
  INACTIVITY: 2,
  CUSTOM: 3,
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: 0,
  PRO: 1,
} as const;

export interface Vault {
  id: string;
  owner: string;
  recipient: string;
  ipfsHash: string;
  unlockTime: number;
  unlockType: number;
  vaultType: number;
  isUnlocked: boolean;
  createdAt: number;
  title?: string;
  description?: string;
  txId?: string;
  decryptedContent?: string;
}

export interface Subscription {
  tier: number;
  startTime: number;
  endTime: number;
  vaultsUsed: number;
  isActive: boolean;
}

export function stringToFields(str: string): { part1: string; part2: string } {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const midpoint = Math.ceil(hex.length / 2);
  const part1Hex = hex.slice(0, midpoint) || '0';
  const part2Hex = hex.slice(midpoint) || '0';
  
  const part1 = BigInt('0x' + part1Hex).toString() + 'field';
  const part2 = BigInt('0x' + part2Hex).toString() + 'field';
  
  return { part1, part2 };
}

export function fieldsToString(part1: string, part2: string): string {
  try {
    const p1 = BigInt(part1.replace('field', '')).toString(16);
    const p2 = BigInt(part2.replace('field', '')).toString(16);
    const hex = p1 + p2;
    
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.slice(i, i + 2), 16));
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return '';
  }
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getVaultStatus(vault: Vault): 'locked' | 'unlockable' | 'opened' {
  if (vault.isUnlocked) return 'opened';
  const now = Date.now();
  if (now >= vault.unlockTime) return 'unlockable';
  return 'locked';
}
