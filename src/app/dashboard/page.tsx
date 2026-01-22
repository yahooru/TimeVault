"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lock, Unlock, Plus, ChevronRight, Inbox, Send, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatAddress, getVaultStatus, Vault } from "@/lib/aleo";
import { getVaults, encryptVaultUrl } from "@/lib/vaultStorage";

export default function DashboardPage() {
  const { isConnected, address, connect } = useWallet();
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<Vault[]>([]);

  useEffect(() => {
    const loadVaults = async () => {
      setLoading(true);
      try {
        const userVaults = await getVaults(address!);
        setVaults(userVaults);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isConnected && address) {
      loadVaults();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchVaults = async () => {
    setLoading(true);
    try {
      const userVaults = await getVaults(address!);
      setVaults(userVaults);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    all: vaults,
    locked: vaults.filter(v => getVaultStatus(v) === 'locked'),
    unlockable: vaults.filter(v => getVaultStatus(v) === 'unlockable'),
    opened: vaults.filter(v => getVaultStatus(v) === 'opened'),
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
            <p className="text-slate-500 mb-8">Please connect your Puzzle wallet to view your private time capsules.</p>
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
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My TimeVaults</h1>
            <p className="text-slate-500">Manage your private digital legacy.</p>
          </div>
          <Link href="/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 rounded-xl shadow-lg shadow-blue-200">
              <Plus className="w-4 h-4" />
              Create New Vault
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              <TabsTrigger value="all" className="rounded-lg px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                All ({categories.all.length})
              </TabsTrigger>
              <TabsTrigger value="locked" className="rounded-lg px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                Locked ({categories.locked.length})
              </TabsTrigger>
              <TabsTrigger value="unlockable" className="rounded-lg px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                Unlockable ({categories.unlockable.length})
              </TabsTrigger>
              <TabsTrigger value="opened" className="rounded-lg px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                Opened ({categories.opened.length})
              </TabsTrigger>
            </TabsList>
            
            <Button variant="ghost" size="sm" onClick={fetchVaults} disabled={loading} className="text-slate-400 hover:text-blue-600">
              Refresh
            </Button>
          </div>

          <AnimatePresence mode="wait">
              <TabsContent value="all" className="m-0">
                <VaultGrid vaults={categories.all} loading={loading} />
              </TabsContent>
              <TabsContent value="locked" className="m-0">
                <VaultGrid vaults={categories.locked} loading={loading} />
              </TabsContent>
              <TabsContent value="unlockable" className="m-0">
                <VaultGrid vaults={categories.unlockable} loading={loading} />
              </TabsContent>
              <TabsContent value="opened" className="m-0">
                <VaultGrid vaults={categories.opened} loading={loading} />
              </TabsContent>
            </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

function VaultGrid({ vaults, loading }: { vaults: Vault[], loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white rounded-2xl animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  if (vaults.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-200 bg-transparent shadow-none">
        <CardContent className="pt-16 pb-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No vaults found</h3>
          <p className="text-slate-500 mb-6">You have not created or received any vaults in this category.</p>
          <Link href="/create">
            <Button variant="outline" className="rounded-lg">Create your first vault</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vaults.map((vault) => (
        <VaultCard key={vault.id} vault={vault} />
      ))}
    </div>
  );
}

function VaultCard({ vault }: { vault: Vault }) {
  const status = getVaultStatus(vault);
  const encryptedUrl = encryptVaultUrl(vault.id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/vault/${encryptedUrl}`}>
        <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
          <div className={`h-1.5 w-full ${
            status === 'opened' ? 'bg-green-500' : 
            status === 'unlockable' ? 'bg-blue-600' : 'bg-slate-300'
          }`} />
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary" className={`${
                status === 'opened' ? 'bg-green-50 text-green-700' : 
                status === 'unlockable' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              } border-none font-medium`}>
                {status === 'unlockable' ? (
                  <span className="flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Ready
                  </span>
                ) : status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <div className="text-slate-300 group-hover:text-blue-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {vault.title || "Untitled Vault"}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Created {new Date(vault.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {status === 'opened' ? 'Unlocked' : 'Unlocks'} <b>{new Date(vault.unlockTime).toLocaleDateString()}</b>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Send className="w-4 h-4 text-slate-400" />
                  <span className="truncate">
                    To: {formatAddress(vault.recipient)}
                  </span>
                </div>
              {vault.txId && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate font-mono">TX: {vault.txId.slice(0, 12)}...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
