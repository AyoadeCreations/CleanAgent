"use client";

import { useAccount, useConnect, useSignMessage } from "wagmi";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  return {
    address,
    isConnected,
    connectors,
    connectAsync,
    connectPending: isPending,
    signMessageAsync,
    signPending: isSigning,
  };
}
