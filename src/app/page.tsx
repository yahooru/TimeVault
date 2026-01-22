"use client";

import { useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Clock, Lock, ArrowRight, Zap, Gem } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { isConnected, connect } = useWallet();

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Privacy First",
      description: "Everything is encrypted client-side and stored on-chain using Aleo's zero-knowledge proofs.",
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      title: "Time-Locked",
      description: "Set precise unlock conditions. Your data remains inaccessible until the exact moment you choose.",
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-500" />,
      title: "Digital Legacy",
      description: "Ensure your secrets, messages, and assets are safely passed on to the right people at the right time.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-1">
                Powered by Aleo & Zero-Knowledge Proofs
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                Send Messages to <span className="text-blue-600">the Future</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                TimeVault is a private digital time capsule. Store secrets, messages, or files that only unlock when the time is right.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {isConnected ? (
                    <>
                      <Link href="/create">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
                          Create TimeVault <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl">
                          View Dashboard
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={connect}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl"
                    >
                      Connect Puzzle Wallet <Zap className="ml-2 w-5 h-5 fill-current" />
                    </Button>
                  )}
                  <Link href="/subscription">
                    <Button size="lg" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl">
                      View Pro Plans <Gem className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 left-1/2 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-blue-50 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md bg-blue-50/30">
                  <CardContent className="pt-8">
                    <div className="mb-4 bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-blue-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Three simple steps to secure your future messages.</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-200">1</div>
                <h4 className="text-lg font-bold mb-2">Create & Encrypt</h4>
                <p className="text-slate-600">Write your message and encrypt it locally in your browser.</p>
              </div>
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-200">2</div>
                <h4 className="text-lg font-bold mb-2">Lock on Aleo</h4>
                <p className="text-slate-600">Set the unlock condition on the Aleo blockchain privately.</p>
              </div>
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-200">3</div>
                <h4 className="text-lg font-bold mb-2">Reveal on Time</h4>
                <p className="text-slate-600">Generate a ZK proof to unlock and decrypt your capsule.</p>
              </div>
              
              {/* Connector lines (hidden on mobile) */}
              <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-blue-100 -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TimeVault</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 TimeVault. Built for Aleo Privacy Buildathon.</p>
        </div>
      </footer>
    </div>
  );
}
