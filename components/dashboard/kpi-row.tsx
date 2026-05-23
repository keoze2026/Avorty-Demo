"use client";

import { motion, type Variants } from "framer-motion";
import { Activity, DollarSign, PhoneCall, Timer } from "lucide-react";

import { KpiTile } from "./kpi-tile";
import { formatCompact, formatCurrency, formatDuration, formatPercent } from "@/lib/format";
import { makeSparkline } from "@/lib/mock/timeseries";

interface KpiRowProps {
  callsToday: number;
  revenueToday: number;
  conversionRate: number; // 0..1
  avgDurationSec: number;
}

const container: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const item: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function KpiRow({ callsToday, revenueToday, conversionRate, avgDurationSec }: KpiRowProps) {
  return (
    <motion.div
      variants={container}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={item}>
        <KpiTile
          label="Calls today"
          icon={PhoneCall}
          value={callsToday}
          formatValue={(v) => formatCompact(Math.round(v))}
          delta={12.4}
          accent="cyan"
          sparkline={makeSparkline(1, 10, 40, 28)}
          foot="vs yesterday"
        />
      </motion.div>
      <motion.div variants={item}>
        <KpiTile
          label="Revenue today"
          icon={DollarSign}
          value={revenueToday}
          formatValue={(v) => formatCurrency(v)}
          delta={8.7}
          accent="emerald"
          sparkline={makeSparkline(2, 10, 60, 22)}
          foot="vs yesterday"
        />
      </motion.div>
      <motion.div variants={item}>
        <KpiTile
          label="Conversion rate"
          icon={Activity}
          value={conversionRate * 100}
          formatValue={(v) => formatPercent(v)}
          delta={-2.1}
          accent="violet"
          sparkline={makeSparkline(3, 10, 50, 18)}
          foot="7-day rolling"
        />
      </motion.div>
      <motion.div variants={item}>
        <KpiTile
          label="Avg call duration"
          icon={Timer}
          value={avgDurationSec}
          formatValue={(v) => formatDuration(Math.round(v))}
          delta={5.2}
          accent="amber"
          sparkline={makeSparkline(4, 10, 70, 26)}
          foot="7-day rolling"
        />
      </motion.div>
    </motion.div>
  );
}
