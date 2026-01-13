"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Shield, Zap, CheckCircle2, AlertTriangle, Play } from "lucide-react"

export default function MasterPage() {
    const [webhookUrl, setWebhookUrl] = useState("")
    const [alertName, setAlertName] = useState("")
    const [isTesting, setIsTesting] = useState(false)
    const [savedWebhooks, setSavedWebhooks] = useState<{ name: string, url: string }[]>([])

    // In a real app, we would fetch saved webhooks from the DB here

    async function handleTestWebhook() {
        if (!webhookUrl) {
            toast.error("Please enter a Webhook URL")
            return
        }

        setIsTesting(true)
        try {
            const res = await fetch("/api/webhooks/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ webhookUrl, name: alertName || "Test Alert" })
            })

            const data = await res.json()

            if (data.success) {
                toast.success("Test alert sent! Check your Discord.")
                // Mock saving
                if (!savedWebhooks.find(w => w.url === webhookUrl)) {
                    setSavedWebhooks([...savedWebhooks, { name: alertName || "New Alert", url: webhookUrl }])
                }
                setWebhookUrl("") // Clear input for security
                setAlertName("")
            } else {
                toast.error(`Failed: ${data.error}`)
            }
        } catch (err) {
            toast.error("Network error. Check console.")
            console.error(err)
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-emerald-500/30 font-sans">
            <Navigation />

            <main className="container mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                            <Shield className="w-8 h-8 text-emerald-500" />
                            Master Dashboard
                        </h1>
                        <p className="text-white/40">Manage your alerts and integrations.</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Captain Hook */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* New Webhook Card */}
                        <Card className="bg-[#111] border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Add New Alert
                                </CardTitle>
                                <CardDescription>Connect a Discord Channel via Captain Hook 🪝</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Alert Name</Label>
                                    <Input
                                        placeholder="e.g. BTC Breakouts"
                                        className="bg-black/50 border-white/10 text-white placeholder:text-white/20"
                                        value={alertName}
                                        onChange={(e) => setAlertName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Discord Webhook URL</Label>
                                    <Input
                                        placeholder="https://discord.com/api/webhooks/..."
                                        type="password"
                                        className="bg-black/50 border-white/10 text-white placeholder:text-white/20 font-mono text-sm"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-white/30">
                                        Go to Discord Channel Settings → Integrations → Webhooks
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold"
                                        onClick={handleTestWebhook}
                                        disabled={isTesting}
                                    >
                                        {isTesting ? "Testing Connection..." : "Test Connection & Save"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Connections */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white/60 px-1">Active Connections</h3>

                            {savedWebhooks.length === 0 && (
                                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                                    <p className="text-white/20 mb-2">No alerts configured</p>
                                    <p className="text-xs text-white/10">Add a webhook above to get started</p>
                                </div>
                            )}

                            {savedWebhooks.map((hook, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[#111] border border-white/10 rounded-xl group hover:border-emerald-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white mb-0.5">{hook.name}</p>
                                            <p className="text-xs text-white/30 font-mono">••••••••••••••••</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                            Active
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Status */}
                    <div className="space-y-6">
                        <Card className="bg-[#111] border-white/10">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest text-white/40">System Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Engine</span>
                                    <span className="text-emerald-400 font-mono">ONLINE</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Data Feed</span>
                                    <span className="text-emerald-400 font-mono">CONNECTED</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Last Scan</span>
                                    <span className="text-white/90 font-mono">Just now</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-500 mb-1 text-sm">Beta Notice</h4>
                                    <p className="text-xs text-yellow-500/60 leading-relaxed">
                                        Captain Hook is currently in beta. All alerts are sent instantly.
                                        Please verify your channel permissions if alerts fail to deliver.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
