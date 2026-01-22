import { supabase } from './supabase';
import { Vault } from './aleo';
import { v4 as uuidv4 } from 'uuid';

export function generateVaultId(): string {
  return uuidv4();
}

export async function saveVault(address: string, vault: Vault) {
  const { data, error } = await supabase
    .from('vaults')
    .insert([
      {
        id: vault.id, 
        creator_address: address,
        recipient_address: vault.recipient,
        cid: vault.ipfsHash,
        title: vault.title || 'Untitled Vault',
        unlock_time: new Date(vault.unlockTime).toISOString(),
        unlock_type: vault.unlockType,
        vault_type: vault.vaultType,
        encrypted_data: vault.decryptedContent || '', 
        tx_id: vault.txId,
        on_chain_id: vault.txId, // Legacy support
        on_chain_vault_id: null, // This will be updated once confirmed
      },
    ])
    .select();

  if (error) {
    console.error('Error saving vault:', error);
    throw new Error('Failed to save vault to database');
  }

  return data[0];
}

interface VaultRecord {
  id: string;
  creator_address: string;
  recipient_address: string | null;
  cid: string;
  title: string;
  unlock_time: string;
  unlock_type: number;
  vault_type: number;
  is_unlocked: boolean;
  created_at: string;
  tx_id: string | null;
  on_chain_id: string | null;
}

export async function getVaults(address: string): Promise<Vault[]> {
  const { data, error } = await supabase
    .from('vaults')
    .select('*')
    .or(`creator_address.eq.${address},recipient_address.eq.${address}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vaults:', error);
    return [];
  }

  return data.map((v: VaultRecord) => ({
    id: v.id,
    owner: v.creator_address,
    recipient: v.recipient_address || v.creator_address,
    ipfsHash: v.cid,
    unlockTime: new Date(v.unlock_time).getTime(),
    unlockType: v.unlock_type || 0,
    vaultType: v.vault_type || 0,
    isUnlocked: v.is_unlocked,
    createdAt: new Date(v.created_at).getTime(),
    title: v.title,
    txId: v.tx_id || v.on_chain_id,
  }));
}

export async function getVaultById(id: string): Promise<Vault | null> {
  const { data, error } = await supabase
    .from('vaults')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching vault:', error);
    return null;
  }

  return {
    id: data.id,
    owner: data.creator_address,
    recipient: data.recipient_address || data.creator_address,
    ipfsHash: data.cid,
    unlockTime: new Date(data.unlock_time).getTime(),
    unlockType: data.unlock_type || 0,
    vaultType: data.vault_type || 0,
    isUnlocked: data.is_unlocked,
    createdAt: new Date(data.created_at).getTime(),
    title: data.title,
    txId: data.tx_id || data.on_chain_id,
  };
}

export async function markVaultUnlocked(id: string) {
  const { error } = await supabase
    .from('vaults')
    .update({ is_unlocked: true })
    .eq('id', id);

  if (error) {
    console.error('Error unlocking vault:', error);
    throw new Error('Failed to update vault status');
  }
}

export async function updateOnChainVaultId(id: string, onChainVaultId: number) {
  const { error } = await supabase
    .from('vaults')
    .update({ on_chain_vault_id: onChainVaultId })
    .eq('id', id);

  if (error) {
    console.error('Error updating on-chain vault ID:', error);
  }
}

export function encryptVaultUrl(vaultId: string): string {
  return vaultId;
}
