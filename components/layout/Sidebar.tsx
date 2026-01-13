"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Search,
    MessageSquare,
    Activity,
    Files,
    Cpu,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    FileSpreadsheet,
    Plus,
    Folder,
    Database
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
}

const navItems = [
    { id: 'dashboard', label: "Master Hub", href: "/master", icon: LayoutDashboard },
    { id: 'leo', label: "LEO Architect", href: "/leo", icon: Cpu },
    { id: 'screeners', label: "Screeners", href: "/screeners", icon: Search },
    { id: 'discord', label: "Alerts", href: "/discord", icon: MessageSquare },
    { id: 'sheets', label: "Sheet Scanner", href: "/google-sheets", icon: FileSpreadsheet },
    { id: 'history', label: "Resources", href: "/how-it-works", icon: Files },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    return (
        <aside
            className={`
                bg-[#050505] border-r border-border flex flex-col z-50 select-none shadow-2xl transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-16' : 'w-64'}
            `}
        >
            {/* Header / Logo */}
            <div className={`p-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-border/50 h-[44px]`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                            <img src="/logo_transparent.png" alt="ScanTrade" className="w-4 h-4 object-contain brightness-0" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-white/90">ScanTrade <span className="text-primary italic">Pro</span></span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-md bg-transparent flex items-center justify-center overflow-hidden px-1">
                        <img src="/logo_transparent.png" alt="ScanTrade" className="w-full h-full object-contain" />
                    </div>
                )}
                {!isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="p-1 px-1.5 rounded-sm hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 px-2 space-y-1">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={`
                                            flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-200 group relative
                                            ${isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                            }
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                        {!isCollapsed && (
                                            <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : ''}`}>
                                                {item.label}
                                            </span>
                                        )}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && (
                                    <TooltipContent side="right" className="bg-[#141414] border-[#404040] text-xs">
                                        {item.label}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>

                {!isCollapsed && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">Collections</div>
                        <button className="w-full flex items-center gap-3 px-2 py-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-all">
                            <Folder className="w-4 h-4" />
                            <span className="text-xs">HFT Screeners</span>
                        </button>
                    </div>
                )}
            </div>

            {/* User Profile / Bottom */}
            <div className="p-2 border-t border-border/50 bg-[#080808]">
                {session?.user ? (
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-1`}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            {session.user.image ? (
                                <img src={session.user.image} alt={session.user.name || ''} className="w-full h-full rounded-full" />
                            ) : (
                                <User className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-zinc-200 truncate leading-tight">{session.user.name}</div>
                                <div className="text-[9px] font-black text-primary uppercase tracking-tighter">Pro member</div>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button
                                onClick={() => signOut()}
                                className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 font-bold'} p-2 text-zinc-500 hover:text-white transition-colors`}>
                        <User className="w-5 h-5" />
                        {!isCollapsed && <span className="text-xs">Sign In</span>}
                    </button>
                )}

                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className={`mt-1 flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3 px-2'} py-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-all`}>
                                <Settings className="w-5 h-5" />
                                {!isCollapsed && <span className="text-xs">Settings</span>}
                            </button>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right" className="bg-[#141414] border-[#404040] text-xs">
                                Settings
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                {isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="mt-1 w-full flex items-center justify-center py-2 text-zinc-500 hover:text-primary transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </aside>
    )
}
