"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Zap, CheckCircle2, LayoutDashboard, Settings, Save, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface MissionControlProps {
    onConfigChange: (config: { sheetId: string, symbol: string }) => void
}

export function MissionControl({ onConfigChange }: MissionControlProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Config State
    const [sheetId, setSheetId] = useState("1CStqiA404-7jfAV_wwcZMVy_pXLEDe2r8xj1XRdA-dg")
    const [symbol, setSymbol] = useState("BTCUSDT")

    // Webhook State
    const [webhookUrl, setWebhookUrl] = useState("")
    const [alertName, setAlertName] = useState("")
    const [isTesting, setIsTesting] = useState(false)
    const [savedWebhooks, setSavedWebhooks] = useState<{ name: string, url: string }[]>([])

    // Load saved config on mount
    useEffect(() => {
        const savedSheet = localStorage.getItem("scantrade_sheet_id")
        const savedSymbol = localStorage.getItem("scantrade_symbol")
        const savedHooks = localStorage.getItem("scantrade_webhooks")

        if (savedSheet) setSheetId(savedSheet)
        if (savedSymbol) setSymbol(savedSymbol)
        if (savedHooks) setSavedWebhooks(JSON.parse(savedHooks))
    }, [])

    const handleSaveConfig = () => {
        localStorage.setItem("scantrade_sheet_id", sheetId)
        localStorage.setItem("scantrade_symbol", symbol)
        onConfigChange({ sheetId, symbol })
        toast.success("Dashboard Configuration Saved")
        setIsOpen(false)
    }

    const handleTestWebhook = async () => {
        if (!webhookUrl) return toast.error("Please enter a Webhook URL")

        setIsTesting(true)
        try {
            const res = await fetch("/api/webhooks/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ webhookUrl, name: alertName || "Test Alert" })
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Test Sent! Webhook Saved.")
                const newHooks = [...savedWebhooks, { name: alertName || "New Alert", url: webhookUrl }]
                setSavedWebhooks(newHooks)
                localStorage.setItem("scantrade_webhooks", JSON.stringify(newHooks))
                setWebhookUrl("")
                setAlertName("")
            } else {
                toast.error(`Failed: ${data.error}`)
            }
        } catch (e) {
            toast.error("Network Error")
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Mission Control</span>
                    <Settings className="w-3 h-3 text-emerald-400 ml-1" />
                </div>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-[#0a0a0a]">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-2xl font-black italic">
                        <LayoutDashboard className="w-6 h-6 text-emerald-500" />
                        MISSION CONTROL
                    </SheetTitle>
                    <SheetDescription>
                        Manage your Data Feeds and Alert Agents.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="config" className="w-full">
                    <TabsList className="w-full bg-white/5 mb-6">
                        <TabsTrigger value="config" className="flex-1 font-bold">Data Config</TabsTrigger>
                        <TabsTrigger value="hooks" className="flex-1 font-bold">Captain Hook 🪝</TabsTrigger>
                    </TabsList>

                    <TabsContent value="config" className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-white">Google Sheet ID</Label>
                                <Input
                                    value={sheetId}
                                    onChange={(e) => setSheetId(e.target.value)}
                                    className="bg-zinc-900 border-white/10 font-mono text-xs text-white/80"
                                />
                                <p className="text-[10px] text-white/30">
                                    The ID between /d/ and /edit in your Google Sheet URL.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white">Default Chart Symbol</Label>
                                <Input
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    className="bg-zinc-900 border-white/10 font-mono text-xs text-white/80"
                                />
                            </div>

                            <Button onClick={handleSaveConfig} className="w-full bg-white text-black font-bold hover:bg-emerald-400">
                                <Save className="w-4 h-4 mr-2" />
                                Update Dashboard
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="hooks" className="space-y-6">
                        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 mb-4">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-500/80 leading-relaxed">
                                    <strong>Security Notice:</strong> Webhooks are stored locally in your browser. Clearing cache will remove them.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 border-b border-white/10 pb-6">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Connect New Agent</h3>
                            <div className="space-y-2">
                                <Label>Alert Name</Label>
                                <Input
                                    placeholder="Crypto-Alerts"
                                    value={alertName}
                                    onChange={(e) => setAlertName(e.target.value)}
                                    className="bg-zinc-900 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Webhook URL</Label>
                                <Input
                                    type="password"
                                    placeholder="https://discord.com/api/webhooks/..."
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    className="bg-zinc-900 border-white/10"
                                />
                            </div>
                            <Button
                                onClick={handleTestWebhook}
                                disabled={isTesting}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold"
                            >
                                {isTesting ? "Verifying..." : "Test & Save Agent"}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Active Agents</h3>
                            {savedWebhooks.map((hook, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{hook.name}</p>
                                            <p className="text-[10px] text-white/30 font-mono">••••••••</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                            ))}
                            {savedWebhooks.length === 0 && (
                                <p className="text-center text-xs text-white/20 py-4">No agents connected yet.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
