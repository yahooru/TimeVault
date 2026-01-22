"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, Shield, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: "Free Tier",
      price: "$0",
      description: "Perfect for testing the future.",
      features: [
        "10 TimeVaults total",
        "Basic AES-256 Encryption",
        "On-chain Verification",
        "Community Support",
      ],
      buttonText: "Current Plan",
      tier: 0,
      popular: false,
    },
    {
      name: "Pro Explorer",
      price: "$9.99",
      period: "/month",
      description: "For the privacy-conscious builder.",
      features: [
        "Unlimited TimeVaults",
        "Advanced AI Enhancement",
        "Priority Support",
        "Custom Unlock Conditions",
        "Zero-Knowledge Proofs",
      ],
      buttonText: "Upgrade to Pro",
      tier: 1,
      popular: true,
    },
  ];

  const handleSubscribe = async (tier: number) => {
    if (tier === 0) {
      toast.info("You are already on the free tier");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-slate-600">Choose the plan that fits your privacy needs.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full border-2 ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-100' : 'border-slate-100 shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                    <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border-4 border-white shadow-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-500 mt-2">{plan.description}</CardDescription>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 ml-1">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full py-6 text-lg rounded-xl transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Security Trust Section */}
        <div className="mt-24 pt-16 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Zero Knowledge</h4>
              <p className="text-sm text-slate-500">Your data stays private. We only verify the math.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Immutable</h4>
              <p className="text-sm text-slate-500">Logic is set in stone on the Aleo blockchain.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Secure Storage</h4>
              <p className="text-sm text-slate-500">Encrypted fragments stored across IPFS via Pinata.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
