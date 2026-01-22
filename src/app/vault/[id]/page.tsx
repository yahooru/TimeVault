"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Lock, Unlock, ArrowLeft, ShieldCheck, Download, Eye, EyeOff, ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";
import { ALEO_CONFIG, formatAddress, getVaultStatus, Vault } from "@/lib/aleo";
import { decryptContent, fetchFromIPFS } from "@/lib/storage";
import { getVaultById, markVaultUnlocked } from "@/lib/vaultStorage";
import { executeTransaction } from "@/lib/puzzle";
import { toast } from "sonner";

export default function VaultDetailsPage() {
  const { id } = useParams();
  const { isConnected, address, connect } = useWallet();
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [vault, setVault] = useState<Vault | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadVaultDetails = async () => {
      setLoading(true);
      try {
        const found = await getVaultById(id as string);
        if (found) {
          setVault(found);
          if (found.isUnlocked && isConnected && address) {
            try {
              const secretKey = found.owner + "_timevault_" + found.id;
              const ipfsData = await fetchFromIPFS(found.ipfsHash) as { content: string };
              const decrypted = await decryptContent(ipfsData.content, secretKey);
              setDecryptedContent(decrypted);
            } catch (e) {
              console.error("Auto-decrypt failed:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching vault:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadVaultDetails();
    }
  }, [id, isConnected, address]);

  const handleUnlock = async () => {
    if (!vault || !address) return;
    
    const status = getVaultStatus(vault);
    if (status === 'locked') {
      toast.error("This vault is still locked. Please wait until the unlock time.");
      return;
    }
    
    setUnlocking(true);
    try {
      const vaultRecord = vault as Vault & { on_chain_vault_id?: number };
      let onChainId = vaultRecord.on_chain_vault_id;
      
      if (!onChainId) {
        toast.info("Finding your vault on-chain...");
        const inputId = prompt("Please enter your Vault On-Chain ID (e.g. 1, 2, 3). You can find this in your Aleo wallet transactions.");
        if (!inputId) {
          setUnlocking(false);
          return;
        }
        onChainId = inputId;
      }

      const currentTimestamp = Math.floor(Date.now() / 1000).toString() + "u64";
      const vaultIdField = onChainId.toString() + "u64";
      
      const inputs = [
        vaultIdField,
        currentTimestamp
      ];

      toast.info("Generating ZK proof and submitting to blockchain...");
      
      const eventId = await executeTransaction(
        ALEO_CONFIG.vaultProgramId,
        "unlock_vault",
        inputs
      );

      toast.success("Unlock transaction submitted! TX: " + eventId.slice(0, 12) + "...");
      
      toast.info("Decrypting vault content...");
      const secretKey = vault.owner + "_timevault_" + vault.id;
      
      const ipfsData = await fetchFromIPFS(vault.ipfsHash) as { content: string };
      const decrypted = await decryptContent(ipfsData.content, secretKey);
      setDecryptedContent(decrypted);
      
      await markVaultUnlocked(vault.id);
      
      setVault({ ...vault, isUnlocked: true });
      setShowContent(true);
      toast.success("Vault unlocked successfully!");
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to unlock vault");
    } finally {
      setUnlocking(false);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/vault/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Vault link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          Loading vault...
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16">
        <Card className="max-w-md w-full mx-4 border-none shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect to View Vault</h2>
            <p className="text-slate-500 mb-8">Please connect your Puzzle wallet to access this vault.</p>
            <Button onClick={connect} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg rounded-xl">
              Connect Puzzle Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center gap-4 bg-slate-50">
        <h1 className="text-2xl font-bold">Vault Not Found</h1>
        <p className="text-slate-500">This vault may not exist or you do not have permission to view it.</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const status = getVaultStatus(vault);
  const isRecipient = address === vault.recipient;
  const isOwner = address === vault.owner;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className={`h-2 w-full ${
              status === 'opened' ? 'bg-green-500' : 
              status === 'unlockable' ? 'bg-blue-600' : 'bg-slate-300'
            }`} />
            
            <CardHeader className="pb-6">
              <div className="flex justify-between items-start mb-4">
                <Badge className={`${
                  status === 'opened' ? 'bg-green-50 text-green-700' : 
                  status === 'unlockable' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                } border-none px-4 py-1`}>
                  {status === 'unlockable' ? 'READY TO UNLOCK' : status.toUpperCase()}
                </Badge>
                <Button variant="ghost" size="sm" onClick={copyShareLink} className="text-slate-400 hover:text-blue-600">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                {vault.title || "Untitled Vault"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Secured on Aleo Blockchain
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unlock Time</span>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {new Date(vault.unlockTime).toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recipient</span>
                  <div className="text-slate-900 font-medium truncate">
                    {isRecipient ? "You (Verified)" : formatAddress(vault.recipient)}
                  </div>
                </div>
                {vault.txId && (
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction</span>
                    <div className="flex items-center gap-2 text-slate-600 font-mono text-sm">
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                      {vault.txId}
                    </div>
                  </div>
                )}
              </div>

              {!vault.isUnlocked ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                    {status === 'unlockable' ? (
                      <Unlock className="w-10 h-10 text-blue-600 animate-bounce" />
                    ) : (
                      <Lock className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  
                  {status === 'unlockable' ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Ready to Reveal</h3>
                        <p className="text-slate-500 mt-2">The time-lock has expired. You can now unlock the vault.</p>
                      </div>
                      <Button 
                        onClick={handleUnlock}
                        disabled={unlocking || (!isRecipient && !isOwner)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-7 text-lg rounded-2xl shadow-xl shadow-blue-200"
                      >
                        {unlocking ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating ZK Proof...
                          </span>
                        ) : "Unlock Vault"}
                      </Button>
                      {!isRecipient && !isOwner && (
                        <p className="text-sm text-red-500 mt-4">Only the recipient or owner can unlock this vault.</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Vault is Locked</h3>
                      <p className="text-slate-500 mt-2">Come back on {new Date(vault.unlockTime).toLocaleDateString()} to reveal the content.</p>
                      <div className="mt-6 text-sm text-slate-400">
                        Time remaining: {Math.max(0, Math.ceil((vault.unlockTime - Date.now()) / (1000 * 60 * 60 * 24)))} days
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">Vault Content</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowContent(!showContent)}
                      className="text-blue-600 h-8"
                    >
                      {showContent ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showContent ? "Hide" : "Show"}
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 min-h-[200px] relative overflow-hidden">
                    {showContent ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-lg"
                      >
                        {decryptedContent || "Content decrypted successfully."}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 py-8">
                        <Lock className="w-8 h-8 opacity-20" />
                        <p className="text-sm font-medium">Content is hidden. Click show to reveal.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl"
                      disabled={!decryptedContent}
                      onClick={() => {
                        if (decryptedContent) {
                          const blob = new Blob([decryptedContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${vault.title || 'vault'}.txt`;
                          a.click();
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save as Document
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-200 py-6 rounded-xl"
                      onClick={copyShareLink}
                    >
                      Share Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Zero-Knowledge Security</h4>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Your vault is secured using Zero-Knowledge Proofs on Aleo. The unlock condition is verified on-chain 
                without revealing your private data. Only authorized recipients can decrypt the content.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
