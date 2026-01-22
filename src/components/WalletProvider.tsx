"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  WalletState, 
  initialWalletState, 
  connectWallet, 
  disconnectWallet, 
  getCurrentAccount, 
  hasPuzzleWallet,
  requestWalletSignature,
  generateAuthMessage,
  storeAuthSession,
  getAuthSession,
  clearAuthSession
} from "@/lib/puzzle";
import { toast } from "sonner";

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  hasWallet: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialWalletState);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const checkWallet = () => {
      setHasWallet(hasPuzzleWallet());
    };
    
    checkWallet();
    const interval = setInterval(checkWallet, 1000);
    
    const existingSession = getAuthSession();
    if (existingSession) {
      getCurrentAccount().then((account) => {
        if (account && account.address === existingSession.address) {
          setState({
            isConnected: true,
            address: account.address,
            network: account.network,
            isLoading: false,
            error: null,
            isVerified: true,
          });
        }
      });
    } else {
      getCurrentAccount().then((account) => {
        if (account) {
          setState({
            isConnected: true,
            address: account.address,
            network: account.network,
            isLoading: false,
            error: null,
            isVerified: false,
          });
        }
      });
    }

    return () => clearInterval(interval);
  }, []);

  const connect = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { address, network } = await connectWallet();
      
      toast.info("Please sign to verify wallet ownership");
      
      try {
        const message = generateAuthMessage(address);
        const signature = await requestWalletSignature(message);
        storeAuthSession(address, signature);
        
        setState({
          isConnected: true,
          address,
          network,
          isLoading: false,
          error: null,
          isVerified: true,
        });
        
        toast.success("Wallet connected and verified!");
      } catch {
        setState({
          isConnected: true,
          address,
          network,
          isLoading: false,
          error: null,
          isVerified: false,
        });
        toast.warning("Connected without signature verification");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Connection failed",
      }));
      toast.error(error instanceof Error ? error.message : "Connection failed");
    }
  };

  const disconnect = async () => {
    await disconnectWallet();
    clearAuthSession();
    setState(initialWalletState);
    toast.success("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, hasWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
