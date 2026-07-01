/**
 * Live-Dialer agent roster + snapshot.
 *
 * A "dialer view" is a call-center floor view: dozens of named agents
 * each in a status (on a call / free / wrapping up / on break), with
 * per-agent counters for the day. Avortyx itself routes to buyers and
 * destinations, not agents, so this surface is demo-only — we generate
 * a believable 200–250-agent roster that rotates with the bucket clock.
 *
 * Two layers of variation:
 *   1. Bucket-stable: total agent count, names, per-agent totals.
 *      A page reload within the same 2h window shows the same numbers.
 *   2. Within-session jitter: the on-call/free split + live counts drift
 *      every refresh tick so the page reads "alive" while the user is
 *      watching. Same trick Live Monitor's socket already uses.
 */

import { makeRng, pick, intRange, range } from "../rng";
import { currentBucket, bucketInt, bucketRange } from "../bucket";
import { liveCallsCount, todaysCalls } from "./calls";

/* ─── Name pools ───────────────────────────────────────────────────────── */

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Jamie", "Riley", "Avery",
  "Quinn", "Drew", "Sage", "Reese", "Cameron", "Skyler", "Hayden", "Rowan",
  "Sarah", "Emily", "Jessica", "Ashley", "Amanda", "Brittany", "Samantha", "Lauren",
  "Michael", "Christopher", "Matthew", "Joshua", "David", "Daniel", "Andrew", "Joseph",
  "Maria", "Carlos", "Sofia", "Diego", "Camila", "Mateo", "Valentina", "Sebastian",
  "Priya", "Arjun", "Anika", "Rohan", "Kavya", "Ishaan", "Ananya", "Dev",
  "Mei", "Wei", "Li", "Chen", "Yuki", "Hiro", "Aiko", "Ren",
  "Olu", "Adaeze", "Chidi", "Ngozi", "Tunde", "Amara", "Kemi", "Bola",
  "Liam", "Noah", "Olivia", "Emma", "Ava", "Sophia", "Mia", "Isabella",
  "Ethan", "Lucas", "Mason", "Logan", "Oliver", "Aiden", "Jackson", "Henry",
  "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Ella", "Madison", "Scarlett",
  "Marcus", "Trevor", "Brandon", "Tyler", "Jason", "Kevin", "Steven", "Nathan",
  "Nicole", "Megan", "Rachel", "Stephanie", "Heather", "Melissa", "Rebecca", "Laura",
  "Anthony", "Gabriel", "Adrian", "Eduardo", "Fernando", "Ricardo", "Andres", "Manuel",
  "Fatima", "Yasmin", "Layla", "Zara", "Nadia", "Aisha", "Mariam", "Salma",
  "Dmitri", "Sergei", "Anastasia", "Natasha", "Ivan", "Alexei", "Katya", "Mikhail",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Patel", "Singh", "Kumar", "Sharma", "Khan", "Ahmed", "Tanaka", "Suzuki",
  "Park", "Choi", "Wong", "Zhang", "Wang", "Liu", "Yamamoto", "Sato",
  "Okafor", "Adeyemi", "Mensah", "Diallo", "Bello", "Eze", "Okonkwo", "Adebayo",
  "Ivanov", "Petrov", "Volkov", "Sokolov", "Popov", "Kuznetsov", "Lebedev", "Novak",
];

/* ─── Status, mix, distribution ───────────────────────────────────────── */

export type DemoAgentStatus = "on_call" | "free" | "wrap_up" | "break";

/** Stable string hash — used to randomize agent ordering deterministically
 *  per snapshot tick. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

const CAMPAIGN_NAMES = [
  "Medicare Open Enrollment 2026",
  "Auto Insurance — High Intent",
  "Solar — Homeowner 700+ FICO",
  "Roofing Storm Damage",
  "Mass Tort Intake — Talc",
  "Debt Relief Consultation",
  "ACA Subsidy Verification",
  "HVAC Installation Leads",
  "Personal Injury Auto",
];

const AREA_CODES = ["212", "415", "713", "404", "305", "303", "617", "773", "206", "619"];

function makePhone(rng: () => number): string {
  const ac = pick(AREA_CODES, rng);
  const tail = String(intRange(rng, 1_000_000, 9_999_999));
  return `+1${ac}${tail}`;
}

/* ─── Wire shape (snake_case so the demo http layer normalizes to camel) ── */

export interface DemoAgentWire {
  id: string;
  name: string;
  initials: string;
  status: DemoAgentStatus;
  /** Populated only when status === "on_call". */
  current_call?: {
    caller: string;
    duration_sec: number;
    campaign: string;
  };
  /** Today-so-far stats (per-agent). */
  calls_today: number;
  sales_today: number;
  missed_today: number;
  /** Hours into the shift, as a fractional number. */
  shift_hours: number;
  /** Average handle time (seconds). */
  avg_handle_sec: number;
}

export interface DemoDialerSnapshotWire {
  agents_online: number;
  agents_on_call: number;
  agents_free: number;
  agents_wrap_up: number;
  agents_break: number;
  calls_live: number;
  calls_missed: number;
  calls_total: number;
  sales: number;
  /** Up to 250 agents — UI guarantees the table never overflows. */
  agents: DemoAgentWire[];
  /** Server-side timestamp so the UI can show "last update X ago". */
  generated_at: number;
}

/* ─── Bucket-stable roster ────────────────────────────────────────────── */

interface Roster {
  bucket: number;
  agents: Array<{
    id: string;
    name: string;
    initials: string;
    callsToday: number;
    salesToday: number;
    missedToday: number;
    shiftHours: number;
    avgHandleSec: number;
  }>;
}

let ROSTER_CACHE: Roster | null = null;

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildRoster(bucket: number): Roster {
  const rng = makeRng(bucket * 73 + 41);
  // Roster is sized to always sit strictly above the peak `liveCallsCount()`
  // ceiling (250 at 11am–2pm EST) so there are always free agents to
  // distribute after the on_call quota is filled. 270–300 gives us a
  // 20–50 agent headroom during peak.
  const count = bucketInt(51, 270, 300);
  const used = new Set<string>();
  const agents: Roster["agents"] = [];
  for (let i = 0; i < count; i++) {
    let name = "";
    // Keep names unique within the roster — drop the first / last name dups.
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `${pick(FIRST_NAMES, rng)} ${pick(LAST_NAMES, rng)}`;
      if (!used.has(candidate)) { name = candidate; break; }
    }
    if (!name) name = `${pick(FIRST_NAMES, rng)} ${pick(LAST_NAMES, rng)}`;
    used.add(name);
    const callsToday = intRange(rng, 8, 96);
    // Per client spec: sales = 10% of connected. Per-agent the band sits
    // 8–12% so the column reads varied without drifting far from 10%.
    const salesToday = Math.floor(callsToday * range(rng, 0.08, 0.12));
    const missedToday = Math.floor(callsToday * range(rng, 0.04, 0.14));
    agents.push({
      id: `agent_${bucket}_${i.toString(36)}`,
      name,
      initials: initials(name),
      callsToday,
      salesToday,
      missedToday,
      shiftHours: Math.round(range(rng, 0.4, 7.8) * 10) / 10,
      avgHandleSec: intRange(rng, 95, 320),
    });
  }
  return { bucket, agents };
}

function currentRoster(): Roster {
  const bucket = currentBucket();
  if (ROSTER_CACHE && ROSTER_CACHE.bucket === bucket) return ROSTER_CACHE;
  ROSTER_CACHE = buildRoster(bucket);
  return ROSTER_CACHE;
}

/* ─── Snapshot (within-session jitter on top of the stable roster) ───── */

/**
 * Builds a fresh snapshot each call. Roster identity (names, totals, ids)
 * stays bucket-stable; only the live status mix + current-call details
 * jitter per call, so successive polls look like real agent activity.
 */
export function dialerSnapshot(): DemoDialerSnapshotWire {
  const roster = currentRoster();
  // Within-session jitter — bucket-stable seed XOR'd with a 4-second tick
  // so successive snapshots within ~4s look identical, but every 4s the
  // status assignment rotates slightly. Feels alive without spinning.
  const tick = Math.floor(Date.now() / 4_000);
  const rng = makeRng(currentBucket() * 911 + tick);

  // ─── Status quotas ──────────────────────────────────────────────────
  // Per client spec, all four categories must sum EXACTLY to the online
  // agent count so the KPI tiles reconcile without visible mismatch:
  //
  //   agents_online = on_call + free + calls_under_dispose + break
  //
  // The number of agents in `on_call` MUST equal `liveCallsCount()` so
  // the legend, the KPI tile, and the topbar pill all report the same
  // value. Calls-under-dispose ("wrap_up" internally) and break carve
  // out small shares (6% + 2%) of the remaining agents so free lands
  // around 92% of the non-on-call pool — matching the client's target
  // of Free ≈ 100 with 210 online and 102 live. Free is computed as
  // the residual so the four counts sum EXACTLY to totalAgents; no
  // rounding drift.
  const totalAgents = roster.agents.length;
  const targetOnCall = Math.min(liveCallsCount(), totalAgents);
  const remaining = totalAgents - targetOnCall;
  const targetWrapUp = Math.round(remaining * 0.06);
  const targetBreak = Math.round(remaining * 0.02);

  // Deterministic shuffle — agents with the lowest hash key land in the
  // "on_call" bucket. The hash blends agent id with the tick so the
  // assignment rotates every 4s.
  const ordered = [...roster.agents].sort(
    (a, b) => (hashStr(a.id) ^ tick) - (hashStr(b.id) ^ tick),
  );
  const statusByAgent = new Map<string, DemoAgentStatus>();
  for (let i = 0; i < ordered.length; i++) {
    let status: DemoAgentStatus;
    if (i < targetOnCall) status = "on_call";
    else if (i < targetOnCall + targetWrapUp) status = "wrap_up";
    else if (i < targetOnCall + targetWrapUp + targetBreak) status = "break";
    else status = "free";
    statusByAgent.set(ordered[i].id, status);
  }

  let onCall = 0, free = 0, wrapUp = 0, breakCount = 0;
  let perAgentSales = 0, perAgentMissed = 0;

  const out: DemoAgentWire[] = roster.agents.map((a) => {
    const status = statusByAgent.get(a.id) ?? "free";
    if (status === "on_call") onCall++;
    else if (status === "free") free++;
    else if (status === "wrap_up") wrapUp++;
    else breakCount++;

    perAgentSales += a.salesToday;
    perAgentMissed += a.missedToday;

    const wire: DemoAgentWire = {
      id: a.id,
      name: a.name,
      initials: a.initials,
      status,
      calls_today: a.callsToday,
      sales_today: a.salesToday,
      missed_today: a.missedToday,
      shift_hours: a.shiftHours,
      avg_handle_sec: a.avgHandleSec,
    };
    if (status === "on_call") {
      wire.current_call = {
        caller: makePhone(rng),
        duration_sec: intRange(rng, 8, 540),
        campaign: pick(CAMPAIGN_NAMES, rng),
      };
    }
    return wire;
  });

  // Headline numbers MUST match the topbar / dashboard — those read from
  // the same call corpus. The agent table's per-agent stats keep their own
  // distribution; only the "Calls running live", "Total calls so far",
  // "Missed calls", and "Sales" KPIs sync to the corpus so the operator
  // sees the same totals on every surface.
  const today = todaysCalls();
  const callsTotal = today.length;
  const connectedFromCorpus = today.filter((c) => c.status === "completed").length;
  const missedFromCorpus = today.length - connectedFromCorpus;
  // Per client spec: sales = 10% of connected (completed) calls. Drops
  // the old "sales = every completed call" conflation.
  const salesFromCorpus = Math.round(connectedFromCorpus * 0.10);

  return {
    agents_online: roster.agents.length,
    agents_on_call: onCall,     // === targetOnCall === liveCallsCount()
    agents_free: free,
    agents_wrap_up: wrapUp,
    agents_break: breakCount,
    calls_live: onCall,         // header KPI mirrors the legend
    calls_missed: missedFromCorpus,
    calls_total: callsTotal,
    sales: salesFromCorpus,     // 10% of connected
    _per_agent_sales: perAgentSales,
    _per_agent_missed: perAgentMissed,
    agents: out,
    generated_at: Date.now(),
  } as DemoDialerSnapshotWire;
}
