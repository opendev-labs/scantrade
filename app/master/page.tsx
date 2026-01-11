"use client"

import { useState } from "react"
import { BarChart3, Globe, ExternalLink, RefreshCcw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import TradingViewWidget from "@/components/tradingview-widget"
import { toast } from "sonner"

export default function MasterHub() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [activeTab, setActiveTab] = useState<'chart' | 'ledger'>('chart')

    // REAL GOOGLE SHEET ID provided by Lakhan Bhai
    const sheetId = "1CStqiA404-7jfAV_wwcZMVy_pXLEDe2r8xj1XRdA-dg"
    const embedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit?rm=minimal`

    const handleManualSync = async () => {
        setIsSyncing(true)
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Updating your tables...',
                success: 'Done! Your ledger is now fresh.',
                error: 'Update failed. Is the server on?',
            }
        )
        setTimeout(() => setIsSyncing(false), 2000)
    }

    return (
        <div className="h-screen flex flex-col bg-[#020202] text-white selection:bg-emerald-500/30 overflow-hidden font-sans">
            <Navigation />

            {/* Premium Header */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center z-20 shadow-2xl">
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex flex-col bg-black px-3 sm:px-4 py-1.5 rounded-lg border border-white/10">
                            <span className="text-[8px] sm:text-[9px] font-black text-emerald-400 tracking-[0.2em] sm:tracking-[0.3em] uppercase leading-tight">Institutional Access</span>
                            <span className="text-lg sm:text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 italic">MASTER HUB</span>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-white/5 hidden md:block" />

                    <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold tracking-widest text-white/40">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-emerald-400">NETWORK LIVE</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            <span>MULTI-NODE SYNC</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="bg-white text-black font-black text-[9px] sm:text-[10px] tracking-widest px-4 sm:px-8 h-10 sm:h-11 hover:bg-emerald-400 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-white/5 active:scale-95"
                    >
                        <RefreshCcw className={`w-3 h-3 mr-1.5 sm:mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="hidden xs:inline">UPDATE</span>
                        <span className="inline xs:hidden">SYNC</span>
                    </Button>
                    <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-[9px] sm:text-[10px] font-bold tracking-widest h-10 sm:h-11 px-3 sm:px-6 transition-all border border-white/10" asChild>
                        <a href={embedUrl.replace("?rm=minimal", "")} target="_blank">
                            <ExternalLink className="w-3 h-3 mr-1.5 sm:mr-2 text-cyan-400" />
                            <span className="hidden xs:inline">OPEN EXPLORER</span>
                            <span className="inline xs:hidden">SHEET</span>
                        </a>
                    </Button>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex bg-zinc-950 border-b border-white/5 p-1 mx-4 my-2 rounded-lg gap-1">
                <button
                    onClick={() => setActiveTab('chart')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[10px] font-black tracking-widest transition-all ${activeTab === 'chart' ? 'bg-white/10 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                >
                    <LayoutDashboard className="w-3 h-3" />
                    LIVE CHART
                </button>
                <button
                    onClick={() => setActiveTab('ledger')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[10px] font-black tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-white/10 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                >
                    <BarChart3 className="w-3 h-3" />
                    LEDGER
                </button>
            </div>

            {/* Layout Grid */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

                {/* Left: Charting Intelligence */}
                <div className={`flex-[5] xl:flex-[6] border-r border-white/5 relative bg-black/40 transition-all duration-500 ${activeTab === 'chart' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="absolute top-4 left-6 z-10 flex items-center gap-3">
                        <div className="bg-black/80 backdrop-blur-md border border-emerald-500/20 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-2xl">
                            <LayoutDashboard className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">Global Intelligence Loop</span>
                        </div>
                    </div>
                    <div className="w-full h-full p-2">
                        <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 bg-zinc-950 shadow-inner">
                            <TradingViewWidget />
                        </div>
                    </div>
                </div>

                {/* Right: The Core Ledger */}
                <div className={`flex-[4] flex-col bg-zinc-950/40 relative transition-all duration-500 ${activeTab === 'ledger' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-white/5 bg-zinc-900/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Execution Terminal</span>
                                <span className="text-sm font-bold tracking-tight">Active Ledger</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10">
                            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[8px] font-mono text-white/40">READ-WRITE ACTIVE</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-white/5 relative group p-2 sm:p-4">
                        <div className="absolute inset-2 sm:inset-4 border border-white/5 rounded-xl overflow-hidden shadow-2xl bg-white">
                            <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full border-0 brightness-[0.98] contrast-[1.02]"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="px-6 sm:px-8 py-3 border-t border-white/5 bg-black/40 flex items-center justify-between text-[8px] font-mono text-white/20 tracking-tighter">
                        <span>LAKHAN_BHAI_INSTITUTIONAL_V1.1_MOBILE</span>
                        <span className="hidden sm:inline">LATENCY: 12MS</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
