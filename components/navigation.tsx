"use client"

import { useState } from "react"
import { Menu, X, Command } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: "Home", href: "https://opendev-labs.github.io/scantrade/", icon: "🏠" },
    { label: "Screeners", href: "https://opendev-labs.github.io/scantrade/screeners", icon: "🔍" },
    { label: "Discord", href: "https://opendev-labs.github.io/scantrade/discord", icon: "💬" },
    { label: "Sheets", href: "https://opendev-labs.github.io/scantrade/google-sheets", icon: "📊" },
    { label: "Pricing", href: "https://opendev-labs.github.io/scantrade/pricing", icon: "💰" },
    { label: "Master", href: "https://scantrade.vercel.app/master", icon: "🔐" },
  ]

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="px-6 md:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <img src="https://scantrade.vercel.app/icon.svg" alt="Logo" className="w-9 h-9 rounded-md shadow-lg shadow-primary/20" />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-sm leading-none">ScanTrade</span>
              <span className="text-xs text-muted-foreground">Simple Alerts</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-0.5">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="group relative">
                <Button
                  variant="ghost"
                  className="text-foreground/70 hover:text-primary smooth-transition hover:bg-primary/5 relative"
                >
                  <span className="text-sm">{item.label}</span>
                </Button>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Command className="w-4 h-4 text-muted-foreground" />
            </Button>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-1 border-t border-border/50 pt-3">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground/70 hover:text-primary hover:bg-primary/5 smooth-transition"
                >
                  <span className="text-sm">{item.label}</span>
                </Button>
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
