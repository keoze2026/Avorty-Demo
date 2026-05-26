"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Eye,
  FileLock2,
  GitBranch,
  Globe,
  HardDrive,
  Heart,
  PlayCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

export function HeroSection() {
  const [codeLineIndex, setCodeLineIndex] = useState(0)
  const [displayedText1, setDisplayedText1] = useState("")
  const [displayedText2, setDisplayedText2] = useState("")
  const [isTypingDone, setIsTypingDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const text1 = "Turn every ring"
  const text2 = "into revenue."

  const codeLines = [
    "import { createClient } from '@vortyx/sdk'",
    "",
    "const vortyx = createClient({",
    "  workspace: 'tier-one-health',",
    "  region: 'auto'",
    "})",
    "",
    "// Live routing webhook",
    "export async function POST(req: Request) {",
    "  const call = await req.json()",
    "  const decision = await vortyx.route(call, {",
    "    campaign: 'health-tier-1',",
    "    minDurationSec: 90",
    "  })",
    "  return Response.json(decision)",
    "}",
    "",
    "// Query last hour of conversions",
    "const conv = await vortyx.calls.list({",
    "  status: 'completed',",
    "  since: '1h',",
    "  groupBy: 'campaign'",
    "})",
    "",
    "// AI-suggested rebalance",
    "const ideas = await vortyx.ai.recommend({",
    "  scope: 'network',",
    "  horizon: '24h'",
    "})",
    "",
    "// Open the marketplace and bid",
    "await vortyx.marketplace.bid({",
    "  vertical: 'health',",
    "  amount: 42.50",
    "})",
  ]

  useEffect(() => {
    let currentIndex = 0
    const fullText = text1 + "|" + text2 // Use | as separator

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        const currentChar = fullText.substring(0, currentIndex)
        const parts = currentChar.split("|")
        setDisplayedText1(parts[0] || "")
        setDisplayedText2(parts[1] || "")
        currentIndex++
      } else {
        clearInterval(typeInterval)
        setIsTypingDone(true)
      }
    }, 80)

    return () => clearInterval(typeInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeLineIndex((prev) => (prev + 1) % codeLines.length)
    }, 800)
    return () => clearInterval(interval)
  }, [codeLines.length])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    interface GridDot {
      x: number
      y: number
      direction: "horizontal" | "vertical"
      speed: number
      size: number
      opacity: number
      color: string
      targetX: number
      targetY: number
      trail: { x: number; y: number }[]
    }

    const colors = ["rgba(255, 255, 255, 0.5)"] // Changed colors array to white with 0.5 opacity
    const gridSize = 64 // 4rem = 64px to match the grid background
    const dotCount = 30 // Increased dot count from 12 to 30

    const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize

    const gridDots: GridDot[] = []

    for (let i = 0; i < dotCount; i++) {
      const isHorizontal = Math.random() > 0.5
      const x = snapToGrid(Math.random() * canvas.offsetWidth)
      const y = snapToGrid(Math.random() * canvas.offsetHeight)

      gridDots.push({
        x,
        y,
        direction: isHorizontal ? "horizontal" : "vertical",
        speed: Math.random() * 9 + 7.5,
        size: Math.random() * 2 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        targetX: x,
        targetY: y,
        trail: [],
      })
    }

    let animationId: number
    let lastTime = 0
    const frameInterval = 1000 / 30

    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate)

      const deltaTime = currentTime - lastTime
      if (deltaTime < frameInterval) return
      lastTime = currentTime - (deltaTime % frameInterval)

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      gridDots.forEach((dot) => {
        dot.trail.unshift({ x: dot.x, y: dot.y })
        if (dot.trail.length > 10) dot.trail.pop()

        if (dot.direction === "horizontal") {
          if (Math.abs(dot.x - dot.targetX) < dot.speed) {
            dot.x = dot.targetX
            if (Math.random() > 0.7) {
              dot.direction = "vertical"
              const steps = Math.floor(Math.random() * 5) + 1
              dot.targetY = dot.y + (Math.random() > 0.5 ? 1 : -1) * steps * gridSize
            } else {
              const steps = Math.floor(Math.random() * 8) + 2
              dot.targetX = dot.x + (Math.random() > 0.5 ? 1 : -1) * steps * gridSize
            }
          } else {
            dot.x += dot.x < dot.targetX ? dot.speed : -dot.speed
          }
        } else {
          if (Math.abs(dot.y - dot.targetY) < dot.speed) {
            dot.y = dot.targetY
            if (Math.random() > 0.7) {
              dot.direction = "horizontal"
              const steps = Math.floor(Math.random() * 8) + 2
              dot.targetX = dot.x + (Math.random() > 0.5 ? 1 : -1) * steps * gridSize
            } else {
              const steps = Math.floor(Math.random() * 5) + 1
              dot.targetY = dot.y + (Math.random() > 0.5 ? 1 : -1) * steps * gridSize
            }
          } else {
            dot.y += dot.y < dot.targetY ? dot.speed : -dot.speed
          }
        }

        if (dot.x < -gridSize) {
          dot.x = canvas.offsetWidth + gridSize
          dot.targetX = dot.x
          dot.trail = []
        }
        if (dot.x > canvas.offsetWidth + gridSize) {
          dot.x = -gridSize
          dot.targetX = dot.x
          dot.trail = []
        }
        if (dot.y < -gridSize) {
          dot.y = canvas.offsetHeight + gridSize
          dot.targetY = dot.y
          dot.trail = []
        }
        if (dot.y > canvas.offsetHeight + gridSize) {
          dot.y = -gridSize
          dot.targetY = dot.y
          dot.trail = []
        }

        if (dot.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(dot.x, dot.y)
          for (let i = 0; i < dot.trail.length; i++) {
            ctx.lineTo(dot.trail[i].x, dot.trail[i].y)
          }
          ctx.strokeStyle = dot.color
          ctx.globalAlpha = dot.opacity * 0.4
          ctx.lineWidth = dot.size
          ctx.lineCap = "round"
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dot.opacity * 0.15
        ctx.fill()

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = dot.color
        ctx.globalAlpha = dot.opacity
        ctx.fill()
      })

      ctx.globalAlpha = 1
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  const chartData = [
    { label: "Health", value: 42, color: "#22c55e" },
    { label: "Solar", value: 24, color: "#f59e0b" },
    { label: "Legal", value: 18, color: "#a855f7" },
    { label: "Auto", value: 16, color: "#3bb6ff" },
  ]

  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercent = 0

  return (
    <section className="relative overflow-hidden pt-20 pb-10 sm:pt-28 sm:pb-16 lg:pt-36">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2937_1px,transparent_1px),linear-gradient(to_bottom,#1F2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_40%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust pill — replaces "public beta" with social proof */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono">500+ networks</span>
            <span className="text-muted-foreground/40">·</span>
            <span>routing live on Vortyx</span>
          </div>

          {/* Big outcome-focused headline */}
          <h1 className="relative font-sans text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            <span className="invisible" aria-hidden="true">
              <span className="text-balance">Turn every ring</span>
              <br />
              <span className="text-balance">into revenue.</span>
            </span>

            <span className="absolute inset-0 flex flex-col items-center">
              <span className="text-balance bg-gradient-to-b from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                {displayedText1}
                {displayedText2 === "" && (
                  <span className="inline-block w-[3px] h-[0.85em] bg-accent ml-1 align-middle animate-pulse" />
                )}
              </span>
              <span className="text-balance bg-gradient-to-r from-[#00E6B8] via-[#22D3EE] to-[#7DE1FF] bg-clip-text text-transparent">
                {displayedText2}
                {displayedText2 !== "" && (
                  <span
                    className={`inline-block w-[3px] h-[0.85em] bg-accent ml-1 align-middle ${
                      isTypingDone ? "animate-blink" : "animate-pulse"
                    }`}
                  />
                )}
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl lg:text-[1.35rem] lg:leading-[1.6]">
            The most intelligent call-tracking platform — real-time routing, live monitoring,
            and AI-driven optimization for the modern pay-per-call network.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href={ROUTES.signup} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group relative h-12 w-full overflow-hidden px-6 text-base font-semibold shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] sm:w-auto"
              >
                <span className="relative z-10 flex items-center">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                {/* shimmer */}
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="group h-12 w-full gap-2 px-6 text-base font-medium backdrop-blur sm:w-auto"
            >
              <PlayCircle className="h-4 w-4 text-accent transition-transform group-hover:scale-110" />
              Watch 90-sec demo
            </Button>
          </div>

          {/* Trust bar — compliance badges + customer count */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> SOC 2 Type II
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <FileLock2 className="h-3.5 w-3.5 text-accent" /> TCPA Ready
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-accent" /> HIPAA Tier
            </span>
            <span className="text-muted-foreground/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-accent fill-accent" /> 4.9 / 5 on G2
            </span>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 blur-3xl opacity-50" />

          <div className="relative overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="relative rounded-xl border border-border/60 bg-[#111827] backdrop-blur-sm overflow-hidden shadow-2xl min-w-[900px] lg:min-w-0">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-[#1F2937]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">Vortyx dashboard</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>Network · 12 verticals</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>142ms decisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-accent">Live</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border/60 bg-[#111827]">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1F2937] border border-border/40">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Activity className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <span className="text-lg font-mono font-bold">312</span>
                    <p className="text-[10px] text-muted-foreground">Calls in flight</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1F2937] border border-border/40">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Cpu className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-lg font-mono font-bold">142ms</span>
                    <p className="text-[10px] text-muted-foreground">Routing latency</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1F2937] border border-border/40">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Database className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <span className="text-lg font-mono font-bold">$24.3K</span>
                    <p className="text-[10px] text-muted-foreground">Revenue today</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1F2937] border border-border/40">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <HardDrive className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-lg font-mono font-bold">96.2%</span>
                    <p className="text-[10px] text-muted-foreground">Buyer match rate</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 divide-x divide-border/60 min-h-[420px]">
                <div className="p-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Live calls</h3>
                  <div className="space-y-2">
                    {[
                      { caller: "+1 (512) 555-0184", status: "live", time: "0:24", campaign: "Health Tier 1", geo: "TX" },
                      { caller: "+1 (305) 555-0721", status: "won", time: "3:12", campaign: "Solar Nationwide", geo: "FL" },
                      { caller: "+1 (415) 555-0932", status: "live", time: "0:08", campaign: "Legal Intake", geo: "CA" },
                      { caller: "+1 (212) 555-0455", status: "won", time: "2:47", campaign: "Health Tier 1", geo: "NY" },
                      { caller: "+1 (404) 555-0617", status: "won", time: "1:53", campaign: "Auto Warranty", geo: "GA" },
                      { caller: "+1 (312) 555-0298", status: "won", time: "4:21", campaign: "Health Tier 1", geo: "IL" },
                    ].map((call, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#1F2937] border border-border/40"
                      >
                        <div className="flex items-center gap-2">
                          {call.status === "won" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <GitBranch className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-mono">{call.caller}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{call.campaign}</span>
                              <span className="text-[10px] text-muted-foreground/60 font-mono">{call.geo}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{call.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Vertical mix</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {chartData.map((item, index) => {
                          const percent = (item.value / total) * 100
                          const dashArray = `${percent * 2.51327} ${251.327 - percent * 2.51327}`
                          const dashOffset = -cumulativePercent * 2.51327
                          cumulativePercent += percent
                          return (
                            <circle
                              key={index}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="12"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                              className="transition-all duration-1000"
                            />
                          )
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-mono font-bold">312</span>
                        <span className="text-[10px] text-muted-foreground">calls / hr</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      {chartData.map((item, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] text-muted-foreground">{item.label}</span>
                          <span className="text-[10px] font-mono text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-medium text-muted-foreground">Top buyers</h4>
                    {[
                      { label: "Apex Insurance", value: 48, color: "bg-accent" },
                      { label: "Solar United", value: 31, color: "bg-purple-500" },
                      { label: "LawHelp Direct", value: 21, color: "bg-amber-500" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-mono">{item.value}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Live analytics</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#1F2937] border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-xs text-muted-foreground">Active buyers</span>
                        </div>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +12%
                        </span>
                      </div>
                      <span className="text-xl font-mono font-bold">28</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1F2937] border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-muted-foreground">Calls today</span>
                        </div>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +24%
                        </span>
                      </div>
                      <span className="text-xl font-mono font-bold">4,812</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1F2937] border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-accent" />
                          <span className="text-xs text-muted-foreground">Calls / min</span>
                        </div>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +5%
                        </span>
                      </div>
                      <span className="text-xl font-mono font-bold">187</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1F2937] border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs text-muted-foreground">Active campaigns</span>
                        </div>
                      </div>
                      <span className="text-xl font-mono font-bold">14</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1F2937] border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-orange-400" />
                          <span className="text-xs text-muted-foreground">Accept rate</span>
                        </div>
                      </div>
                      <span className="text-xl font-mono font-bold">94.7%</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">SDK</h3>
                  <div className="rounded-lg bg-[#0A0F1C] border border-border/40 p-3 font-mono text-[11px] h-[340px] overflow-hidden">
                    <div
                      className="transition-transform duration-300 ease-out"
                      style={{ transform: `translateY(-${codeLineIndex * 22}px)` }}
                    >
                      {[...codeLines, ...codeLines].map((line, i) => (
                        <div
                          key={i}
                          className={`h-[22px] leading-[22px] ${
                            line.startsWith("import")
                              ? "text-purple-400"
                              : line.startsWith("export")
                                ? "text-blue-400"
                                : line.startsWith("const")
                                  ? "text-accent"
                                  : line.includes("return")
                                    ? "text-pink-400"
                                    : line.includes("await")
                                      ? "text-yellow-400"
                                      : line.startsWith("//")
                                        ? "text-muted-foreground/60 italic"
                                        : "text-muted-foreground"
                          }`}
                        >
                          {line || " "}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex justify-center mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Scroll to explore</span>
              <ArrowRight className="h-3 w-3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
