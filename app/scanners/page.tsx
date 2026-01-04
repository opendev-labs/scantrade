"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Zap, Settings, Activity, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { fetchScanners, toggleScanner } from "@/lib/api"
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

export default function ScannersPage() {
  const [scanners, setScanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [scanInterval, setScanInterval] = useState("60")

  const handleConfig = () => {
    setIsConfiguring(false)
    toast.success(`Scanning interval updated to ${scanInterval}s`, {
      description: "All automated engines synchronized to new clock cycle.",
    })
  }

  const updateScanners = async () => {
    try {
      const data = await fetchScanners()
      setScanners(data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch scanners:", err)
    }
  }

  useEffect(() => {
    updateScanners()
    const interval = setInterval(updateScanners, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleToggle = async (id: string) => {
    try {
      await toggleScanner(id)
      updateScanners()
    } catch (err) {
      console.error("Failed to toggle scanner:", err)
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BULLISH":
        return "text-emerald-400"
      case "BEARISH":
        return "text-rose-400"
      case "OVERSOLD":
        return "text-cyan-400"
      case "READY":
        return "text-yellow-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getSignalBg = (signal: string) => {
    switch (signal) {
      case "BULLISH":
        return "bg-emerald-400/10 border-emerald-400/30"
      case "BEARISH":
        return "bg-rose-400/10 border-rose-400/30"
      case "OVERSOLD":
        return "bg-cyan-400/10 border-cyan-400/30"
      case "READY":
        return "bg-yellow-400/10 border-yellow-400/30"
      default:
        return "bg-muted/10 border-border"
    }
  }

  const activeScanners = scanners.filter((s) => s.status === "active").length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                Market Scanners
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Monitor {activeScanners}/5 automated market analysis engines with AI-powered signal detection
              </p>
            </div>
            <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 smooth-transition">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect border-primary/20">
                <DialogHeader>
                  <DialogTitle>Scanner Synchronization</DialogTitle>
                  <DialogDescription>
                    Adjust the analytical clock cycle for all institutional market scanners.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scan-interval">Scan Interval (Seconds)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="scan-interval"
                        type="number"
                        value={scanInterval}
                        onChange={(e) => setScanInterval(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Lower intervals increase resource load but provide faster signal detection.</p>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsConfiguring(false)}>Cancel</Button>
                  <Button onClick={handleConfig}>Sync Engines</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/20 via-accent/10 to-transparent" />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active</span>
                <Zap className="w-4 h-4 text-primary opacity-50" />
              </div>
              <p className="text-3xl font-bold text-primary mb-1">{activeScanners}/5</p>
              <p className="text-xs text-muted-foreground">Scanners online</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Signals</span>
                <Activity className="w-4 h-4 text-cyan-400 opacity-50" />
              </div>
              <p className="text-3xl font-bold text-cyan-400 mb-1">23</p>
              <p className="text-xs text-muted-foreground">Generated today</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Avg Confidence
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-50" />
              </div>
              <p className="text-3xl font-bold text-emerald-400 mb-1">82%</p>
              <p className="text-xs text-muted-foreground">Accuracy rate</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Performance</span>
                <span className="text-xs font-bold text-emerald-400">+24.8%</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400 mb-1">+24.8%</p>
              <p className="text-xs text-muted-foreground">30-day returns</p>
            </CardContent>
          </Card>
        </div>

        {/* Scanner Cards */}
        <div className="space-y-4">
          {scanners.map((scanner) => (
            <Card
              key={scanner.id}
              className={`glass-effect border smooth-transition cursor-pointer group ${scanner.status === "active"
                ? "border-primary/30 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/15"
                : "border-border opacity-60 hover:opacity-80"
                }`}
            >
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 ${scanner.status === "active" ? "bg-emerald-400" : "bg-muted"}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary smooth-transition">
                          {scanner.name}
                        </h3>
                        <p className="text-xs font-mono text-muted-foreground/70">{scanner.condition}</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section - Signal */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-2 rounded-md border font-bold text-sm ${getSignalColor(scanner.signal)} ${getSignalBg(scanner.signal)}`}
                    >
                      {scanner.signal}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{scanner.lastUpdate}</p>
                      <p className="text-xs font-mono text-primary/70">{scanner.signals} signals</p>
                    </div>
                  </div>

                  {/* Right Section - Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${scanner.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-primary">{scanner.confidence}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">30d Return</p>
                      <p
                        className={`text-sm font-bold ${Number.parseFloat(scanner.performance) > 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {scanner.performance}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border hover:border-primary/50 hover:bg-primary/5 bg-transparent smooth-transition"
                      >
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleToggle(scanner.id)}
                        className={scanner.status === "active" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary"}
                      >
                        {scanner.status === "active" ? "Pause" : "Start"}
                      </Button>
                    </div>
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
