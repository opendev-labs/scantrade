"use client"

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopHeader } from '@/components/layout/TopHeader'
import { TooltipProvider } from '@/components/ui/tooltip'

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // Persist sidebar state
    useEffect(() => {
        setIsMounted(true)
        const savedState = localStorage.getItem('scantrade-sidebar-collapsed')
        if (savedState !== null) {
            setIsSidebarCollapsed(savedState === 'true')
        }
    }, [])

    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => {
            const newState = !prev
            localStorage.setItem('scantrade-sidebar-collapsed', String(newState))
            return newState
        })
    }, [])

    // Keyboard shortcut Ctrl+B
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault()
                toggleSidebar()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleSidebar])

    if (!isMounted) return null

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen bg-[#050505] overflow-hidden">
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

                <div className="flex-1 flex flex-col min-w-0">
                    <TopHeader onToggleSidebar={toggleSidebar} isSidebarVisible={!isSidebarCollapsed} />
                    <main className="flex-1 h-full overflow-auto custom-scrollbar bg-background">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    )
}
