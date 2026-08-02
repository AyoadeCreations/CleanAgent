"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DashboardSummary,
  TransactionDTO,
  AgentDTO,
  RuleDTO,
} from "@/lib/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? "Request failed");
  return data.data as T;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher<DashboardSummary>("/api/dashboard"),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetcher<{ transactions: TransactionDTO[] }>("/api/transaction"),
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => fetcher<{ agents: AgentDTO[] }>("/api/agent"),
  });
}

export function useRules() {
  return useQuery({
    queryKey: ["rules"],
    queryFn: () => fetcher<{ rules: RuleDTO[] }>("/api/rule"),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () =>
      fetcher<{
        logs: Array<{
          id: string;
          action: string;
          resourceType: string;
          resourceId: string;
          actorRole: string;
          actorName: string | null;
          actorAddress: string | null;
          metadata: Record<string, unknown> | null;
          ipAddress: string | null;
          createdAt: string;
        }>;
      }>("/api/audit"),
    retry: false,
  });
}

export interface ReportEntry {
  id: string;
  reportHash: string;
  type: string;
  createdAt: string;
  data: {
    periodStart: string;
    periodEnd: string;
    totalVolume: number;
    transactions: number;
    flags: number;
    suspensions: number;
    blocked: number;
    generatedBy: string;
  };
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () =>
      fetcher<{ report: ReportEntry; history: ReportEntry[] }>("/api/report"),
  });
}

export interface BusinessDTO {
  id: string;
  name: string;
  description: string | null;
  status: string;
  agentCount: number;
  ruleCount: number;
  createdAt: string;
}

export function useBusiness() {
  return useQuery({
    queryKey: ["business"],
    queryFn: () => fetcher<{ business: BusinessDTO | null }>("/api/business"),
  });
}

export function useTransactionActions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      fetch(`/api/transaction/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
