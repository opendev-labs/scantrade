"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowRight, Loader2, Github, Globe, Server, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isStatic, setIsStatic] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/master";

    useEffect(() => {
        // Detect if we are on GitHub Pages (static) or Vercel (dynamic)
        const hostname = window.location.hostname;
        if (hostname.includes("github.io")) {
            setIsStatic(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setError("Invalid credentials. Access Denied.");
                setIsLoading(false);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError("Session initialization failed. System error.");
            setIsLoading(false);
        }
    };

    const handleGitHubSignIn = () => {
        if (isStatic) {
            window.location.href = "https://scantrade.vercel.app/signin";
            return;
        }
        signIn("github", { callbackUrl });
    };

    return (
        <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative font-sans">
            {/* Background elements for premium feel */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/2 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="w-full max-w-[400px] relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative group"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                        <img src="/logo_transparent.png" alt="ScanTrade" className="w-12 h-12 object-contain relative z-10" />
                    </motion.div>

                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                        SCANT RADE <span className="text-primary glow-text-primary">V2</span>
                    </h1>
                    <div className="h-[1px] w-12 bg-primary/50 my-2" />
                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-black italic">Advanced Intelligence Node</p>
                </div>

                <AnimatePresence mode="wait">
                    {isStatic ? (
                        <motion.div
                            key="static-warning"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-effect p-8 border-primary/20 bg-primary/5 relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase mb-1">Static Node Detected</h3>
                                    <p className="text-zinc-400 text-xs leading-relaxed">
                                        You are currently on the static documentation mirror. Authentication requires a live production environment.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => window.location.href = "https://scantrade.vercel.app/signin"}
                                className="w-full bg-primary hover:bg-[#FF8A5E] text-black font-black py-3 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl uppercase text-xs"
                            >
                                Connect to Lead Node <Server className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>

                            <div className="mt-6 flex items-center gap-2 justify-center">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Awaiting Tunnel Handshake</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="auth-form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="glass-effect p-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Trader Identity</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                                placeholder="identity@scantrade.network"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center px-0.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Access Protocol</label>
                                            <Link href="#" className="text-[9px] text-primary/60 hover:text-primary transition-colors font-bold uppercase tracking-tighter">Emergency Override?</Link>
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm py-3 px-4 text-sm text-white placeholder:text-zinc-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold leading-tight flex items-center gap-2"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:bg-[#FF8A5E] disabled:bg-zinc-900 disabled:text-zinc-700 text-black font-black py-3 rounded-sm transition-all flex items-center justify-center gap-2 group shadow-xl active:scale-[0.98] uppercase text-xs"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                System Initialization <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/5" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase">
                                        <span className="bg-[#050505] px-4 text-zinc-600 font-bold tracking-[0.2em]">or multi-factor</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGitHubSignIn}
                                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-xs uppercase"
                                >
                                    <Github className="w-4 h-4" />
                                    Synchronize via GitHub
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-8 text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-primary/50" /> 256-BIT AES
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-8">
                            NON-CUSTODIAL NODE
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-[10px] text-zinc-800 max-w-[280px] leading-relaxed italic font-medium">
                            SCANTRADE CORE v2.4.0. AUTHORIZED ACCESS ONLY. ALL SESSIONS ARE CRYPTOGRAPHICALLY LOGGED.
                        </p>
                        <div className="flex justify-center gap-4 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                            <Link href="/terms" className="hover:text-primary transition-colors">Compliance</Link>
                            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Shield</Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Terminal Decoration */}
            <div className="fixed bottom-4 left-4 font-mono text-[8px] text-zinc-800 uppercase space-y-1 pointer-events-none hidden lg:block">
                <p>node_status: optimal</p>
                <p>connection: encrypted</p>
                <p>lat: 23ms</p>
            </div>

            <div className="fixed bottom-4 right-4 font-mono text-[8px] text-zinc-800 uppercase space-y-1 pointer-events-none hidden lg:block">
                <p>© opendev-labs</p>
                <p>scantrade.network</p>
            </div>
        </div>
    );
}
