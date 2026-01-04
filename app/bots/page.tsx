"use client"

import { useState, useEffect } from "react"
import { Zap, PauseCircle, PlayCircle, TrendingUp, Target, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { fetchBots, toggleBot as apiToggleBot } from "@/lib/api"
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

export default function BotsPage() {
  const [bots, setBots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newBotName, setNewBotName] = useState("AlphaBot-7")
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = () => {
    setIsDeploying(false)
    toast.promise(new Promise((res) => setTimeout(res, 1500)), {
      loading: `Provisioning environment for ${newBotName}...`,
      success: `${newBotName} has been successfully registered in the governance cluster.`,
      error: "Failed to deploy bot.",
    })
  }

  const updateBots = async () => {
    try {
      const data = await fetchBots()
      setBots(data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch bots:", err)
    }
  }

  useEffect(() => {
    updateBots()
    const interval = setInterval(updateBots, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleToggle = async (id: string) => {
    try {
      await apiToggleBot(id)
      updateBots()
    } catch (err) {
      console.error("Failed to toggle bot:", err)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
      case "MEDIUM":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
      case "HIGH":
        return "bg-rose-400/10 text-rose-400 border-rose-400/30"
      default:
        return "bg-secondary text-foreground"
    }
  }

  const activeBots = bots.filter((b) => b.status === "active").length
  const totalCapital = bots.filter((b) => b.status === "active").reduce((sum, b) => sum + Number.parseInt(b.capital), 0)
  const portfolioReturn = bots
    .filter((b) => b.status === "active")
    .reduce((sum, b) => sum + Number.parseFloat(b.returns), 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Zap className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                Trading Bots
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Manage {activeBots}/10 semi-automated trading agents governed by health score
              </p>
            </div>
            <Dialog open={isDeploying} onOpenChange={setIsDeploying}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 smooth-transition">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Deploy New
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect border-primary/20">
                <DialogHeader>
                  <DialogTitle>Deploy Intelligence Agent</DialogTitle>
                  <DialogDescription>
                    Configure a new automated agent to be governed by the institutional health score.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Agent Identity</Label>
                    <Input
                      id="bot-name"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      placeholder="e.g. AlphaBot-7"
                    />
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Governance Status</p>
                    <p className="text-xs text-emerald-400">Environment Ready • Verification Pending</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDeploying(false)}>Cancel</Button>
                  <Button onClick={handleDeploy}>Execute Deployment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/20 via-accent/10 to-transparent" />
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Bots</span>
                <Zap className="w-4 h-4 text-primary opacity-50" />
              </div>
              <p className="text-3xl font-bold text-primary mb-1">{activeBots}/10</p>
              <p className="text-xs text-muted-foreground">Deployed</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Capital</span>
                <Shield className="w-4 h-4 text-cyan-400 opacity-50" />
              </div>
              <p className="text-3xl font-bold text-cyan-400 mb-1">{totalCapital}%</p>
              <p className="text-xs text-muted-foreground">Deployed</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Return</span>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-50" />
              </div>
              <p className={`text-3xl font-bold mb-1 ${portfolioReturn > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {portfolioReturn > 0 ? "+" : ""}
                {portfolioReturn.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Portfolio return</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Trades</span>
                <Target className="w-4 h-4 text-blue-400 opacity-50" />
              </div>
              <p className="text-3xl font-bold text-blue-400 mb-1">
                {bots.filter((b) => b.status === "active").reduce((sum, b) => sum + b.trades, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Executed</p>
            </CardContent>
          </Card>
        </div>

        {/* Bot Cards */}
        <div className="space-y-4">
          {bots.map((bot) => (
            <Card
              key={bot.id}
              className={`glass-effect border smooth-transition group ${bot.status === "active"
                ? "border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/15"
                : "border-border opacity-60 hover:opacity-80"
                }`}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left - Bot Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 ${bot.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-muted"}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary smooth-transition">
                          {bot.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{bot.strategy} Strategy</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle - Performance */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${bot.winRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-primary">{bot.winRate}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Return</p>
                      <p
                        className={`text-sm font-bold ${Number.parseFloat(bot.returns) > 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {bot.returns}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Risk</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getRiskColor(bot.risk)}`}
                      >
                        {bot.risk}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Capital</p>
                      <p className="text-sm font-bold text-cyan-400">{bot.capital}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Trades</p>
                      <p className="text-sm font-bold">{bot.trades}</p>
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-primary/50 hover:bg-primary/5 bg-transparent smooth-transition"
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleToggle(bot.bot_id || bot.id)}
                      className={
                        bot.status === "active"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary border border-border hover:bg-secondary/80"
                      }
                    >
                      {bot.status === "active" ? (
                        <>
                          <PauseCircle className="w-4 h-4 mr-1.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-1.5" />
                          Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
