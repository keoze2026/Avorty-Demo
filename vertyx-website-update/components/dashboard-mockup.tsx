"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  Phone,
  Activity,
  Users,
  BarChart3,
  Settings,
  Zap,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  PhoneIncoming,
  PhoneOutgoing,
  Building2,
  Layers,
  FileText,
  HelpCircle,
} from "lucide-react"

export function DashboardMockup() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  }

  const panelVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      y: -80,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      className="w-full h-full bg-zinc-950 flex overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <motion.div
        className="w-[220px] h-full bg-zinc-900/80 border-r border-zinc-800/50 flex flex-col shrink-0"
        variants={panelVariants}
      >
        {/* Logo */}
        <div className="p-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Phone className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">Avortyx</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-auto" />
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/50 rounded-md text-zinc-500 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <span className="ml-auto text-[10px] bg-zinc-700/50 px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="px-3 space-y-0.5">
          <NavItem icon={Activity} label="Live Monitor" badge={312} active />
          <NavItem icon={Phone} label="Calls" />
        </div>

        {/* Network section */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Network
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Layers} label="Campaigns" hasSubmenu />
            <NavItem icon={Building2} label="Buyers" hasSubmenu />
            <NavItem icon={Users} label="Publishers" hasSubmenu />
            <NavItem icon={BarChart3} label="Analytics" hasSubmenu />
          </div>
        </div>

        {/* Verticals section */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Verticals
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Target} label="Health Insurance" color="text-emerald-400" />
            <NavItem icon={Zap} label="Solar" color="text-yellow-400" />
            <NavItem icon={FileText} label="Legal" color="text-blue-400" />
          </div>
        </div>

        {/* Configuration section */}
        <div className="mt-5 px-3 flex-1">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Configure
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Settings} label="Ring Trees" hasSubmenu />
            <NavItem icon={Zap} label="Routing Rules" hasSubmenu />
          </div>
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-zinc-800/50">
          <NavItem icon={HelpCircle} label="Documentation" />
        </div>
      </motion.div>

      {/* Live Calls List */}
      <motion.div
        className="w-[320px] h-full bg-zinc-900/40 border-r border-zinc-800/50 flex flex-col shrink-0"
        variants={panelVariants}
      >
        <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm">Live Calls</h3>
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              312 active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <CallItem
            phone="+1 (512) 555-0184"
            campaign="Health Tier 1"
            state="TX"
            duration="0:24"
            status="connected"
            active
          />
          <CallItem
            phone="+1 (305) 555-0721"
            campaign="Solar Nationwide"
            state="FL"
            duration="3:12"
            status="connected"
          />
          <CallItem
            phone="+1 (415) 555-0932"
            campaign="Legal Intake"
            state="CA"
            duration="0:08"
            status="ringing"
          />
          <CallItem
            phone="+1 (212) 555-0455"
            campaign="Health Tier 1"
            state="NY"
            duration="2:47"
            status="connected"
          />
          <CallItem
            phone="+1 (404) 555-0617"
            campaign="Auto Warranty"
            state="GA"
            duration="1:53"
            status="connected"
          />
          <CallItem
            phone="+1 (312) 555-0298"
            campaign="Health Tier 1"
            state="IL"
            duration="4:21"
            status="connected"
          />
          <CallItem
            phone="+1 (602) 555-0847"
            campaign="Solar Southwest"
            state="AZ"
            duration="0:45"
            status="connected"
          />
          <CallItem
            phone="+1 (718) 555-0392"
            campaign="Legal Mass Tort"
            state="NY"
            duration="1:12"
            status="connected"
          />
        </div>
      </motion.div>

      {/* Detail Panel - Live Dashboard */}
      <motion.div className="flex-1 h-full bg-zinc-950 flex flex-col overflow-hidden" variants={panelVariants}>
        {/* Header breadcrumb */}
        <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Avortyx dashboard</span>
            <span className="text-zinc-600">›</span>
            <span className="text-emerald-400">Network · 12 verticals</span>
            <span className="text-zinc-600">›</span>
            <span className="text-zinc-300">142ms decisioning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </span>
            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-5 grid grid-cols-4 gap-4">
          <StatCard icon={Phone} label="Calls in flight" value="312" trend="+24%" />
          <StatCard icon={Clock} label="Routing latency" value="142ms" trend="-8%" positive />
          <StatCard icon={DollarSign} label="Revenue today" value="$24.3K" trend="+18%" />
          <StatCard icon={Target} label="Buyer match rate" value="96.2%" trend="+2.1%" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-auto scrollbar-hide">
          {/* Vertical Mix */}
          <div className="bg-zinc-900/80 rounded-lg p-4 mb-5 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-medium">Vertical Mix</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>312 calls / hr</span>
              </div>
            </div>
            <div className="space-y-3">
              <VerticalBar label="Health" percentage={42} color="bg-emerald-500" />
              <VerticalBar label="Solar" percentage={24} color="bg-yellow-500" />
              <VerticalBar label="Legal" percentage={18} color="bg-blue-500" />
              <VerticalBar label="Auto" percentage={16} color="bg-orange-500" />
            </div>
          </div>

          {/* Top Buyers */}
          <div className="bg-zinc-900/80 rounded-lg p-4 mb-5 border border-zinc-800/50">
            <h3 className="text-white text-sm font-medium mb-4">Top Buyers</h3>
            <div className="space-y-2">
              <BuyerRow name="Apex Insurance" percentage={48} />
              <BuyerRow name="Solar United" percentage={31} />
              <BuyerRow name="LawHelp Direct" percentage={21} />
            </div>
          </div>

          {/* Activity */}
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">Recent Activity</div>
            <div className="space-y-3">
              <ActivityItem
                icon={PhoneIncoming}
                action="Call routed to"
                target="Apex Insurance"
                campaign="Health Tier 1"
                time="2 sec ago"
              />
              <ActivityItem
                icon={DollarSign}
                action="Conversion recorded"
                target="$42.50"
                campaign="Solar Nationwide"
                time="15 sec ago"
              />
              <ActivityItem
                icon={PhoneOutgoing}
                action="Call completed"
                target="4:23 duration"
                campaign="Legal Intake"
                time="1 min ago"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
  hasSubmenu,
  color,
}: {
  icon: React.ElementType
  label: string
  badge?: number
  active?: boolean
  hasSubmenu?: boolean
  color?: string
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
    >
      <Icon className={`w-4 h-4 ${color || ""}`} />
      <span className="flex-1 text-xs">{label}</span>
      {badge && (
        <span className="bg-emerald-500/80 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
          {badge}
        </span>
      )}
      {hasSubmenu && <ChevronRight className="w-3 h-3 text-zinc-600" />}
    </div>
  )
}

function CallItem({
  phone,
  campaign,
  state,
  duration,
  status,
  active,
}: {
  phone: string
  campaign: string
  state: string
  duration: string
  status: "connected" | "ringing" | "ended"
  active?: boolean
}) {
  const statusColors = {
    connected: "bg-emerald-500",
    ringing: "bg-yellow-500 animate-pulse",
    ended: "bg-zinc-500",
  }

  return (
    <div
      className={`px-4 py-3 border-b border-zinc-800/30 cursor-pointer transition-colors ${
        active ? "bg-zinc-800/50" : "hover:bg-zinc-800/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
          <Phone className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-zinc-300 text-xs font-medium">{phone}</span>
            <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px]">{campaign}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500 text-[10px]">{state}</span>
          </div>
        </div>
        <span className="text-zinc-400 text-xs font-mono">{duration}</span>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ElementType
  label: string
  value: string
  trend: string
  positive?: boolean
}) {
  const isPositive = trend.startsWith("+") || positive
  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-zinc-500" />
        <span className="text-zinc-500 text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-white text-xl font-semibold">{value}</span>
        <span className={`text-xs ${isPositive ? "text-emerald-400" : "text-red-400"}`}>{trend}</span>
      </div>
    </div>
  )
}

function VerticalBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-400 text-xs w-12">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-zinc-300 text-xs font-medium w-8 text-right">{percentage}%</span>
    </div>
  )
}

function BuyerRow({ name, percentage }: { name: string; percentage: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-300 text-sm">{name}</span>
      <span className="text-zinc-400 text-sm">{percentage}%</span>
    </div>
  )
}

function ActivityItem({
  icon: Icon,
  action,
  target,
  campaign,
  time,
}: {
  icon: React.ElementType
  action: string
  target: string
  campaign: string
  time: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
        <Icon className="w-3 h-3 text-zinc-400" />
      </div>
      <div className="flex-1">
        <p className="text-zinc-400 text-xs">
          <span className="text-zinc-500">{action} </span>
          <span className="text-white">{target}</span>
          <span className="text-zinc-500"> · </span>
          <span className="text-zinc-400">{campaign}</span>
        </p>
        <p className="text-zinc-600 text-[10px] mt-0.5">{time}</p>
      </div>
    </div>
  )
}
