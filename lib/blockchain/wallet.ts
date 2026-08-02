import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { monadTestnet } from "./monad";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [injected()];
if (projectId) {
  connectors.push(
    walletConnect({
      projectId,
      metadata: {
        name: "CleanFlow",
        description: "AI-powered trust, compliance and payment orchestration.",
        url: "https://cleanflow.example.com",
        icons: [],
      },
    }),
  );
}

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors,
  transports: {
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
  },
});
