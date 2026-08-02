"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, BotIcon, PencilIcon } from "lucide-react";
import { useAgents } from "@/hooks/use-api";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { AgentDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  PAUSED: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  SUSPENDED: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  DEACTIVATED: "bg-muted text-muted-foreground border-border",
};

interface FormState {
  name: string;
  description: string;
  walletAddress: string;
  dailyLimit: string;
  monthlyLimit: string;
}

const EMPTY: FormState = { name: "", description: "", walletAddress: "", dailyLimit: "1000", monthlyLimit: "30000" };

export function AgentsView() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAgents();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editAgent, setEditAgent] = React.useState<AgentDTO | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY);
    setCreateOpen(true);
  }

  function openEdit(agent: AgentDTO) {
    setEditAgent(agent);
    setForm({
      name: agent.name,
      description: agent.description ?? "",
      walletAddress: agent.walletAddress ?? "",
      dailyLimit: String(agent.dailyLimit),
      monthlyLimit: String(agent.monthlyLimit),
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Agent name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/agent/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          walletAddress: form.walletAddress || undefined,
          dailyLimit: Number(form.dailyLimit) || 0,
          monthlyLimit: Number(form.monthlyLimit) || 0,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to create agent");
      toast.success("Agent created");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editAgent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/agent/${editAgent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          dailyLimit: Number(form.dailyLimit) || 0,
          monthlyLimit: Number(form.monthlyLimit) || 0,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to update agent");
      toast.success("Agent updated");
      setEditAgent(null);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update agent");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(agent: AgentDTO, status: "ACTIVE" | "PAUSED" | "DEACTIVATED") {
    try {
      const res = await fetch(`/api/agent/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed to update agent");
      toast.success(`Agent ${status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update agent");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <PlusIcon />
          New agent
        </Button>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}
      {!isLoading && (data?.agents ?? []).length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
          <BotIcon className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No agents yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Agents execute transactions with enforced spending limits.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <PlusIcon />
            Create your first agent
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.agents ?? []).map((agent) => (
          <Card key={agent.id}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BotIcon className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.description ?? "No description"}</div>
                  </div>
                </div>
                <Badge variant="outline" className={cn("font-mono", STATUS_STYLES[agent.status])}>
                  {agent.status.toLowerCase()}
                </Badge>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border bg-background/60 p-2">
                  <dt className="text-muted-foreground">Daily limit</dt>
                  <dd className="mt-0.5 font-mono font-medium">{formatNumber(agent.dailyLimit)}</dd>
                </div>
                <div className="rounded-md border bg-background/60 p-2">
                  <dt className="text-muted-foreground">Monthly limit</dt>
                  <dd className="mt-0.5 font-mono font-medium">{formatNumber(agent.monthlyLimit)}</dd>
                </div>
              </dl>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatNumber(agent.transactionCount, 0)} txns
                  {agent.lastUsedAt ? ` · ${formatRelativeTime(agent.lastUsedAt)}` : ""}
                </span>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => openEdit(agent)}>
                    <PencilIcon />
                    Edit
                  </Button>
                  {agent.status === "ACTIVE" ? (
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(agent, "PAUSED")}>
                      Pause
                    </Button>
                  ) : agent.status === "PAUSED" ? (
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(agent, "ACTIVE")}>
                      Activate
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New agent</DialogTitle>
            <DialogDescription>
              Agents execute transactions on your behalf within hard spending limits.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ag-name">Name</Label>
              <Input id="ag-name" placeholder="Payroll runner" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag-desc">Description (optional)</Label>
              <Textarea id="ag-desc" placeholder="What this agent does" value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag-wallet">Wallet address (optional)</Label>
              <Input id="ag-wallet" placeholder="0x…" className="font-mono" value={form.walletAddress} onChange={(e) => update("walletAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ag-daily">Daily limit</Label>
                <Input id="ag-daily" type="number" min="0" value={form.dailyLimit} onChange={(e) => update("dailyLimit", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ag-monthly">Monthly limit</Label>
                <Input id="ag-monthly" type="number" min="0" value={form.monthlyLimit} onChange={(e) => update("monthlyLimit", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create agent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editAgent)} onOpenChange={(v) => !v && setEditAgent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit agent</DialogTitle>
            <DialogDescription>Update agent details and limits.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ag-edit-name">Name</Label>
              <Input id="ag-edit-name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag-edit-desc">Description</Label>
              <Textarea id="ag-edit-desc" value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ag-edit-daily">Daily limit</Label>
                <Input id="ag-edit-daily" type="number" min="0" value={form.dailyLimit} onChange={(e) => update("dailyLimit", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ag-edit-monthly">Monthly limit</Label>
                <Input id="ag-edit-monthly" type="number" min="0" value={form.monthlyLimit} onChange={(e) => update("monthlyLimit", e.target.value)} />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between">
              {editAgent && editAgent.status !== "DEACTIVATED" && (
                <Button type="button" variant="destructive" onClick={() => toggleStatus(editAgent, "DEACTIVATED")}>
                  Deactivate
                </Button>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditAgent(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
