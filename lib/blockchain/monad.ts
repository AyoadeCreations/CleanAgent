import { defineChain } from "viem";
import { MONAD_TESTNET } from "@/lib/constants";

export const monadTestnet = defineChain(MONAD_TESTNET);

export const DEFAULT_CHAIN = monadTestnet;
