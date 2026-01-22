"use client";

import { ReactNode } from "react";
import { WalletProvider } from "./WalletProvider";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}
