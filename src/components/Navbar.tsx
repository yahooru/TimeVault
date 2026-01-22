"use client";

import Link from "next/link";
import { useWallet } from "@/components/WalletProvider";
import { Button } from "@/components/ui/button";
import { Clock, Menu, X, Zap, LayoutDashboard, Gem, Info, ShieldCheck, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { isConnected, address, connect, disconnect, isVerified } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features", icon: Info },
    { name: "Create Vault", href: "/create", icon: Clock, requiresAuth: true },
    { name: "Subscription", href: "/subscription", icon: Gem },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-blue-100 py-3 shadow-sm" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-200">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Time<span className="text-blue-600 group-hover:text-slate-900">Vault</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            (!link.requiresAuth || isConnected) && (
              <Link key={link.name} href={link.href} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                {link.name}
              </Link>
            )
          ))}
          {isConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-mono border border-blue-100">
                {isVerified ? (
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <Shield className="w-4 h-4 text-yellow-600" />
                )}
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <Button variant="ghost" onClick={disconnect} className="text-slate-500 hover:text-red-500">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connect} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
              Connect Wallet <Zap className="ml-2 w-4 h-4 fill-current" />
            </Button>
          )}
        </div>

        <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-blue-100 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                (!link.requiresAuth || isConnected) && (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-700 font-medium"
                  >
                    <link.icon className="w-5 h-5 text-blue-500" />
                    {link.name}
                  </Link>
                )
              ))}
              {isConnected ? (
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-mono">
                    {isVerified ? (
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-yellow-600" />
                    )}
                    {address?.slice(0, 10)}...{address?.slice(-6)}
                  </div>
                  <Button variant="destructive" onClick={disconnect} className="rounded-xl">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={() => { connect(); setIsOpen(false); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6">
                  Connect Wallet <Zap className="ml-2 w-4 h-4 fill-current" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
