"use client";

import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Clock, Lock, Send, Sparkles, ShieldCheck, Info } from "lucide-react";
import { uploadToIPFS, encryptContent, enhanceWithAI } from "@/lib/storage";
import { executeTransaction } from "@/lib/puzzle";
import { ALEO_CONFIG, stringToFields, Vault } from "@/lib/aleo";
import { saveVault, generateVaultId } from "@/lib/vaultStorage";
import { useRouter } from "next/navigation";

export default function CreateVaultPage() {
  const { isConnected, address, connect } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    recipient: "",
    unlockTime: "",
    vaultType: "0",
    unlockType: "0",
  });

  const handleEnhance = async () => {
    if (!formData.content) {
      toast.error("Please enter some content first");
      return;
    }
    setEnhancing(true);
    try {
      const enhanced = await enhanceWithAI(formData.content);
      setFormData({ ...formData, content: enhanced });
      toast.success("Message enhanced by AI!");
    } catch {
      toast.error("Failed to enhance message");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }

    if (!formData.content || !formData.unlockTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const vaultId = generateVaultId();
      const secretKey = address + "_timevault_" + vaultId;
      const encrypted = await encryptContent(formData.content, secretKey);
      
      const ipfsPayload = {
        title: formData.title || "Untitled Vault",
        content: encrypted,
        type: formData.vaultType,
        recipient: formData.recipient || address,
        vaultId,
        createdAt: Date.now(),
      };
      
      toast.info("Uploading to IPFS...");
      const ipfsHash = await uploadToIPFS(ipfsPayload);
      const { part1, part2 } = stringToFields(ipfsHash);
      
      const unlockTimestamp = Math.floor(new Date(formData.unlockTime).getTime() / 1000).toString() + "u64";
      const currentTimestamp = Math.floor(Date.now() / 1000).toString() + "u64";
      const recipientAddr = formData.recipient || address;
      
      const inputs = [
        recipientAddr,
        part1,
        part2,
        unlockTimestamp,
        formData.unlockType + "u8",
        formData.vaultType + "u8",
        currentTimestamp
      ];

      toast.info("Submitting to Aleo blockchain...");
      const eventId = await executeTransaction(
        ALEO_CONFIG.vaultProgramId,
        "create_vault",
        inputs
      );

        const vault: Vault = {
          id: vaultId,
          owner: address,
          recipient: recipientAddr,
          ipfsHash,
          unlockTime: new Date(formData.unlockTime).getTime(),
          unlockType: parseInt(formData.unlockType),
          vaultType: parseInt(formData.vaultType),
          isUnlocked: false,
          createdAt: Date.now(),
          title: formData.title || "Untitled Vault",
          txId: eventId,
          decryptedContent: formData.content, // Temporary for saving
        };

        await saveVault(address, vault);
        
        toast.success(`Vault created! TX: ${eventId.slice(0, 12)}...`);
        router.push(`/dashboard`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create vault");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16">
        <Card className="max-w-md w-full mx-4 border-none shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Wallet</h2>
            <p className="text-slate-500 mb-8">Please connect your Puzzle wallet to create time-locked vaults.</p>
            <Button onClick={connect} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg rounded-xl">
              Connect Puzzle Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create a New TimeVault</h1>
            <p className="text-slate-600">Lock your data securely on the Aleo blockchain.</p>
          </div>

          <Card className="border-none shadow-xl shadow-blue-100/50 bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Vault Details
              </CardTitle>
              <CardDescription>Fill in the details for your private time capsule.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Vault Title (Optional)</Label>
                  <Input 
                    id="title" 
                    placeholder="Message to my future self" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Vault Type</Label>
                    <Select 
                      value={formData.vaultType} 
                      onValueChange={(v) => setFormData({ ...formData, vaultType: v })}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Text Message</SelectItem>
                        <SelectItem value="1">File Reference</SelectItem>
                        <SelectItem value="2">Legacy Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unlock-time">Unlock Date & Time</Label>
                    <Input 
                      id="unlock-time" 
                      type="datetime-local" 
                      required
                      value={formData.unlockTime}
                      onChange={(e) => setFormData({ ...formData, unlockTime: e.target.value })}
                      className="border-slate-200 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address (Default: Your Wallet)</Label>
                  <Input 
                    id="recipient" 
                    placeholder="aleo1..." 
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Leave empty to send to yourself.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <Label htmlFor="content">Vault Content</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleEnhance}
                      disabled={enhancing || !formData.content}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 gap-1"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${enhancing ? 'animate-spin' : ''}`} />
                      {enhancing ? "Enhancing..." : "Enhance with AI"}
                    </Button>
                  </div>
                  <Textarea 
                    id="content" 
                    placeholder="Type your message here..." 
                    rows={6}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="border-slate-200 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 font-medium">End-to-end encrypted</span>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg min-w-[140px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Lock Vault
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Time-Locked Security</h4>
                <p className="text-xs text-slate-600">Logic is enforced on-chain. No one can unlock it early.</p>
              </div>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Private Metadata</h4>
                <p className="text-xs text-slate-600">Your address and interactions remain private on Aleo.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
