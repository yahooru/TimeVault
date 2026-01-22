"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/components/WalletProvider";
import { executeTransaction } from "@/lib/puzzle";
import { ALEO_CONFIG } from "@/lib/aleo";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { isConnected, connect } = useWallet();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  const handleActivateOnChain = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      connect();
      return;
    }

    setActivating(true);
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000).toString() + "u64";
      const tier = "1u8";

      const eventId = await executeTransaction(
        ALEO_CONFIG.subscriptionProgramId,
        "subscribe",
        [tier, currentTimestamp]
      );

      setTxId(eventId);
      setActivated(true);
      toast.success("On-chain subscription activated!");
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("Failed to activate on-chain subscription");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-sky-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-sky-200 shadow-2xl shadow-sky-100 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-10 h-10 text-sky-600" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-sky-100">Welcome to TimeVault Pro Explorer</p>
              </div>

              <CardContent className="p-8 space-y-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    $9.99/month
                  </div>
                  <p className="text-slate-600">
                    Your payment has been processed. Now activate your subscription on-chain to unlock all Pro features.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-sky-500" />
                    Your Pro Benefits
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Unlimited TimeVaults",
                      "Advanced AI Enhancement",
                      "Priority Support",
                      "Custom Unlock Conditions",
                      "Zero-Knowledge Proofs",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-sky-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {!activated ? (
                  <div className="space-y-4">
                    <Button
                      onClick={handleActivateOnChain}
                      disabled={activating}
                      className="w-full py-6 text-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-200 rounded-xl"
                    >
                      {activating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Activate On-Chain Subscription
                        </>
                      )}
                    </Button>
                    {!isConnected && (
                      <p className="text-sm text-center text-slate-500">
                        Connect your wallet to activate
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-800">Subscription Activated!</p>
                      {txId && (
                        <p className="text-xs text-green-600 mt-2 break-all">
                          TX: {txId}
                        </p>
                      )}
                    </div>
                    <Link href="/create">
                      <Button className="w-full py-6 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                        Start Creating Vaults
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}

                {sessionId && (
                  <p className="text-xs text-center text-slate-400">
                    Session: {sessionId.slice(0, 20)}...
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
