"use client";

/**
 * 3-pane Avortyx dashboard simulation used inside the hero 3D stage.
 * Reskinned to use the project's theme tokens — no hardcoded zinc colors.
 */

import type React from "react";
import { motion } from "framer-motion";

import { useTranslation } from "@/hooks/use-translation";

import {
  Activity,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  Layers,
  MoreHorizontal,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Plus,
  Search,
  Settings,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export function DashboardMockup() {
  const { t } = useTranslation();
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const panelVariants = {
    hidden: { opacity: 0, x: 100, y: -80 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <motion.div
      className="w-full h-full bg-background flex overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <motion.div
        className="w-[220px] h-full bg-card/80 border-r border-border/60 flex flex-col shrink-0"
        variants={panelVariants}
      >
        {/* Logo */}
        <div className="p-3 border-b border-border/60">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Phone className="w-5 h-5 text-foreground" />
            <span className="text-foreground font-semibold text-sm">Avortyx</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-secondary/60 rounded-md text-muted-foreground text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>{t("marketingUI.dashboardMockup.search")}</span>
            <span className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="px-3 space-y-0.5">
          <NavItem icon={Activity} label={t("marketingUI.dashboardMockup.navLiveMonitor")} badge={312} active />
          <NavItem icon={Phone} label={t("marketingUI.dashboardMockup.navCalls")} />
        </div>

        {/* Network section */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {t("marketingUI.dashboardMockup.sectionNetwork")}
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Layers} label={t("marketingUI.dashboardMockup.navCampaigns")} hasSubmenu />
            <NavItem icon={Building2} label={t("marketingUI.dashboardMockup.navBuyers")} hasSubmenu />
            <NavItem icon={Users} label={t("marketingUI.dashboardMockup.navPublishers")} hasSubmenu />
            <NavItem icon={BarChart3} label={t("marketingUI.dashboardMockup.navAnalytics")} hasSubmenu />
          </div>
        </div>

        {/* Verticals section */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {t("marketingUI.dashboardMockup.sectionVerticals")}
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Target} label={t("marketingUI.dashboardMockup.navHealthInsurance")} />
            <NavItem icon={Zap} label={t("marketingUI.dashboardMockup.navSolar")} />
            <NavItem icon={FileText} label={t("marketingUI.dashboardMockup.navLegal")} />
          </div>
        </div>

        {/* Configuration section */}
        <div className="mt-5 px-3 flex-1">
          <div className="px-2 py-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {t("marketingUI.dashboardMockup.sectionConfigure")}
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={Settings} label={t("marketingUI.dashboardMockup.navRingTrees")} hasSubmenu />
            <NavItem icon={Zap} label={t("marketingUI.dashboardMockup.navRoutingRules")} hasSubmenu />
          </div>
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-border/60">
          <NavItem icon={HelpCircle} label={t("marketingUI.dashboardMockup.navDocumentation")} />
        </div>
      </motion.div>

      {/* Live Calls List */}
      <motion.div
        className="w-[320px] h-full bg-card/40 border-r border-border/60 flex flex-col shrink-0"
        variants={panelVariants}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground font-semibold text-sm">{t("marketingUI.dashboardMockup.liveCalls")}</h3>
            <span className="flex items-center gap-1 text-[color:var(--success)] text-xs">
              <span className="w-1.5 h-1.5 bg-[color:var(--success)] rounded-full animate-pulse" />
              312 {t("marketingUI.dashboardMockup.activeSuffix")}
            </span>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <CallItem phone="+15125550184" campaign="Health Tier 1" state="TX" duration="0:24" status="connected" active />
          <CallItem phone="+13055550721" campaign="Solar Nationwide" state="FL" duration="3:12" status="connected" />
          <CallItem phone="+14155550932" campaign="Legal Intake" state="CA" duration="0:08" status="ringing" />
          <CallItem phone="+12125550455" campaign="Health Tier 1" state="NY" duration="2:47" status="connected" />
          <CallItem phone="+14045550617" campaign="Auto Warranty" state="GA" duration="1:53" status="connected" />
          <CallItem phone="+13125550298" campaign="Health Tier 1" state="IL" duration="4:21" status="connected" />
          <CallItem phone="+16025550847" campaign="Solar Southwest" state="AZ" duration="0:45" status="connected" />
          <CallItem phone="+17185550392" campaign="Legal Mass Tort" state="NY" duration="1:12" status="connected" />
        </div>
      </motion.div>

      {/* Detail Panel — Live Dashboard */}
      <motion.div className="flex-1 h-full bg-background flex flex-col overflow-hidden" variants={panelVariants}>
        {/* Header breadcrumb */}
        <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">{t("marketingUI.dashboardMockup.breadcrumbDashboard")}</span>
            <span className="text-muted-foreground/60">›</span>
            <span className="text-[color:var(--success)]">{t("marketingUI.dashboardMockup.breadcrumbNetwork")}</span>
            <span className="text-muted-foreground/60">›</span>
            <span className="text-foreground/85">{t("marketingUI.dashboardMockup.breadcrumbDecisioning")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[color:var(--success)] text-xs font-medium">
              <span className="w-2 h-2 bg-[color:var(--success)] rounded-full animate-pulse" />
              {t("marketingUI.dashboardMockup.live")}
            </span>
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-5 grid grid-cols-4 gap-4">
          <StatCard icon={Phone} label={t("marketingUI.dashboardMockup.statCallsInFlight")} value="312" trend="+24%" />
          <StatCard icon={Clock} label={t("marketingUI.dashboardMockup.statRoutingLatency")} value="142ms" trend="-8%" positive />
          <StatCard icon={DollarSign} label={t("marketingUI.dashboardMockup.statRevenueToday")} value="$24.3K" trend="+18%" />
          <StatCard icon={Target} label={t("marketingUI.dashboardMockup.statBuyerMatchRate")} value="96.2%" trend="+2.1%" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-auto scrollbar-hide">
          {/* Vertical Mix */}
          <div className="bg-card/80 rounded-lg p-4 mb-5 border border-border/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground text-sm font-medium">{t("marketingUI.dashboardMockup.verticalMix")}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t("marketingUI.dashboardMockup.callsPerHour")}</span>
              </div>
            </div>
            <div className="space-y-3">
              <VerticalBar label={t("marketingUI.dashboardMockup.verticalHealth")} percentage={42} />
              <VerticalBar label={t("marketingUI.dashboardMockup.verticalSolar")} percentage={24} />
              <VerticalBar label={t("marketingUI.dashboardMockup.verticalLegal")} percentage={18} />
              <VerticalBar label={t("marketingUI.dashboardMockup.verticalAuto")} percentage={16} />
            </div>
          </div>

          {/* Top Buyers */}
          <div className="bg-card/80 rounded-lg p-4 mb-5 border border-border/60">
            <h3 className="text-foreground text-sm font-medium mb-4">{t("marketingUI.dashboardMockup.topBuyers")}</h3>
            <div className="space-y-2">
              <BuyerRow name="Apex Insurance" percentage={48} />
              <BuyerRow name="Solar United" percentage={31} />
              <BuyerRow name="LawHelp Direct" percentage={21} />
            </div>
          </div>

          {/* Activity */}
          <div className="pt-4 border-t border-border/60">
            <div className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">
              {t("marketingUI.dashboardMockup.recentActivity")}
            </div>
            <div className="space-y-3">
              <ActivityItem icon={PhoneIncoming} action={t("marketingUI.dashboardMockup.actionRoutedTo")} target="Apex Insurance" campaign="Health Tier 1" time={t("marketingUI.dashboardMockup.timeSecAgo")} />
              <ActivityItem icon={DollarSign} action={t("marketingUI.dashboardMockup.actionConversionRecorded")} target="$42.50" campaign="Solar Nationwide" time={t("marketingUI.dashboardMockup.time15SecAgo")} />
              <ActivityItem icon={PhoneOutgoing} action={t("marketingUI.dashboardMockup.actionCallCompleted")} target={`4:23 ${t("marketingUI.dashboardMockup.durationSuffix")}`} campaign="Legal Intake" time={t("marketingUI.dashboardMockup.time1MinAgo")} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
  hasSubmenu,
}: {
  icon: React.ElementType;
  label: string;
  badge?: number;
  active?: boolean;
  hasSubmenu?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground/85"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-xs">{label}</span>
      {badge && (
        <span className="bg-accent text-accent-foreground text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
          {badge}
        </span>
      )}
      {hasSubmenu && <ChevronRight className="w-3 h-3 text-muted-foreground/60" />}
    </div>
  );
}

function CallItem({
  phone,
  campaign,
  state,
  duration,
  status,
  active,
}: {
  phone: string;
  campaign: string;
  state: string;
  duration: string;
  status: "connected" | "ringing" | "ended";
  active?: boolean;
}) {
  const statusColors = {
    connected: "bg-[color:var(--success)]",
    ringing: "bg-[color:var(--warning)] animate-pulse",
    ended: "bg-muted-foreground",
  };
  return (
    <div
      className={`px-4 py-3 border-b border-border/40 cursor-pointer transition-colors ${
        active ? "bg-secondary/50" : "hover:bg-secondary/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <Phone className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-foreground/85 text-xs font-medium">{phone}</span>
            <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[10px]">{campaign}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground text-[10px]">{state}</span>
          </div>
        </div>
        <span className="text-muted-foreground text-xs font-mono">{duration}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  positive?: boolean;
}) {
  const isPositive = trend.startsWith("+") || positive;
  return (
    <div className="bg-card/50 rounded-lg p-4 border border-border/60">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-foreground text-xl font-semibold">{value}</span>
        <span className={`text-xs ${isPositive ? "text-[color:var(--success)]" : "text-destructive"}`}>{trend}</span>
      </div>
    </div>
  );
}

function VerticalBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-xs w-12">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-foreground/85 text-xs font-medium w-8 text-right">{percentage}%</span>
    </div>
  );
}

function BuyerRow({ name, percentage }: { name: string; percentage: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/85 text-sm">{name}</span>
      <span className="text-muted-foreground text-sm">{percentage}%</span>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  action,
  target,
  campaign,
  time,
}: {
  icon: React.ElementType;
  action: string;
  target: string;
  campaign: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
        <Icon className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-muted-foreground text-xs">
          <span className="text-muted-foreground">{action} </span>
          <span className="text-foreground">{target}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="text-muted-foreground">{campaign}</span>
        </p>
        <p className="text-muted-foreground/60 text-[10px] mt-0.5">{time}</p>
      </div>
    </div>
  );
}
