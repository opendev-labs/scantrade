"use client"

import { useState } from "react"
import { AlertTriangle, Settings, Lock, Info, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GovernancePage() {
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [newRuleTitle, setNewRuleTitle] = useState("Volatility Circuit Breaker")

  const handleAddRule = () => {
    setIsAddingRule(false)
    toast.info(`New governance rule proposal: ${newRuleTitle}`, {
      description: "Rule has been queued for institutional audit and consensus verification.",
    })
  }

  const rules = [
    {
      id: 1,
      title: "Max Active Bots",
      condition: "Health Score > 70",
      action: "5 bots allowed",
      enabled: true,
      priority: "HIGH",
    },
    {
      id: 2,
      title: "Disable High Risk",
      condition: "Health Score < 70",
      action: "Pause HIGH risk bots",
      enabled: true,
      priority: "CRITICAL",
    },
    {
      id: 3,
      title: "Capital Preservation Mode",
      condition: "Health Score < 50",
      action: "Exit all positions",
      enabled: true,
      priority: "CRITICAL",
    },
    {
      id: 4,
      title: "Max Drawdown Protection",
      condition: "Drawdown > 5%",
      action: "Reduce position size by 20%",
      enabled: true,
      priority: "HIGH",
    },
    {
      id: 5,
      title: "Volatility Spike Detection",
      condition: "BB Width > 2σ",
      action: "Reduce leverage, wait for compression",
      enabled: true,
      priority: "MEDIUM",
    },
    {
      id: 6,
      title: "Win Rate Threshold",
      condition: "Win Rate < 50%",
      action: "Reduce capital allocation by 50%",
      enabled: false,
      priority: "MEDIUM",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-400/10 text-rose-400 border-rose-400/30"
      case "HIGH":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
      case "MEDIUM":
        return "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
      default:
        return "bg-secondary text-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Lock className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                Governance Rules
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Configure risk management rules and automated trading constraints
              </p>
            </div>
            <Dialog open={isAddingRule} onOpenChange={setIsAddingRule}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 smooth-transition">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect border-primary/20">
                <DialogHeader>
                  <DialogTitle>Propose Governance Rule</DialogTitle>
                  <DialogDescription>
                    Define a new risk constraint to be applied across all automated strategies.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule-title">Rule Definition</Label>
                    <Input
                      id="rule-title"
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      placeholder="e.g. Volatility Circuit Breaker"
                    />
                  </div>
                  <div className="p-3 bg-rose-400/10 rounded-lg border border-rose-400/20">
                    <p className="text-xs text-rose-400">Requires institutional consensus and audit trail.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddingRule(false)}>Cancel</Button>
                  <Button onClick={handleAddRule}>Submit Proposal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/20 via-accent/10 to-transparent" />
        </div>

        {/* Health Score Formula */}
        <Card className="glass-effect border-primary/30 glow-intense mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Health Score Formula
            </CardTitle>
            <CardDescription>Weighted calculation determining bot eligibility and risk limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Trend Alignment Score", weight: "30%", color: "text-primary" },
                { label: "Volatility Stability", weight: "25%", color: "text-cyan-400" },
                { label: "Drawdown Control", weight: "20%", color: "text-emerald-400" },
                { label: "Win Rate Performance", weight: "15%", color: "text-blue-400" },
                { label: "AI Confidence Level", weight: "10%", color: "text-violet-400" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 smooth-transition"
                >
                  <span className="text-sm">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.weight}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-sm text-foreground/80">
                Health Score = (Trend × 0.30) + (Volatility × 0.25) + (Drawdown × 0.20) + (Win Rate × 0.15) + (AI
                Confidence × 0.10)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Rules */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Risk Management Rules
          </h2>
          <div className="space-y-3">
            {rules.map((rule) => (
              <Card
                key={rule.id}
                className={`glass-effect border smooth-transition group ${rule.enabled ? "border-primary/30 hover:border-primary/50" : "border-border opacity-60"}`}
              >
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left - Rule Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 ${rule.enabled ? "bg-emerald-400" : "bg-muted"}`}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{rule.title}</h3>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground/80">
                              <strong>Trigger:</strong> {rule.condition}
                            </p>
                            <p className="text-xs text-primary/90">
                              <strong>Action:</strong> {rule.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle - Priority */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Priority</p>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${getPriorityColor(rule.priority)}`}
                      >
                        {rule.priority}
                      </span>
                    </div>

                    {/* Right - Toggle & Edit */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-border hover:border-primary/50 smooth-transition ${rule.enabled ? "hover:bg-primary/5" : ""} bg-transparent`}
                      >
                        {rule.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border hover:border-primary/50 hover:bg-primary/5 bg-transparent smooth-transition"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alerts & Notices */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-rose-400/10 to-rose-400/5 border border-rose-400/30 glow-intense">
            <CardContent className="pt-6 pb-6">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-rose-400 mb-2">Risk Management Notice</h3>
                  <p className="text-sm text-rose-400/90 mb-4">
                    Governance rules are non-negotiable safeguards. Modifying or disabling them requires admin approval
                    and will be logged for audit purposes. Unauthorized changes may trigger immediate trading halt.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-rose-400 text-background hover:bg-rose-400/90 smooth-transition">
                      Request Override
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-rose-400/30 text-rose-400 hover:bg-rose-400/10 bg-transparent"
                    >
                      View Audit Log
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-6 pb-6">
              <div className="flex gap-4">
                <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-cyan-400 mb-1">Health Score Status</h3>
                  <p className="text-sm text-muted-foreground/80">
                    Current score: <strong className="text-primary">78/100 (HEALTHY)</strong> - All bots operating
                    within constraints. Next rule check in 30s.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
