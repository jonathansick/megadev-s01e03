// How #4471 splits into the problems it really holds. The page says it in words; this is what runs.
//
// causes.ts tells `parser` from `hint` by tenant. It also knows a third kind: reports the desk
// read as a one-day move (desk-notes.json), which causes.ts counts where the tenant rule filed
// them and footnotes. Here each problem gets its own group, so a ticket can carry its own count
// and the counts add up to the reports merged into the ticket.
import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day-move' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day-move';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<Report['channel'], number>;
  // What intake tagged these reports as: tag → count. Intake guesses from the browser, not the tenant.
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const count = <K extends string>(keys: K[]): Record<K, number> =>
  keys.reduce((n, k) => ({ ...n, [k]: (n[k] ?? 0) + 1 }), {} as Record<K, number>);

export function splitByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const byProblem = new Map<Problem, Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: count(rs.map((r) => r.channel)),
        taggedAs: count(rs.map((r) => r.meta.intakeTag)),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

// Reports whose intake tag names a different problem than the one they belong to.
export function mistagged(groups: ProblemGroup[]): number {
  return groups.reduce(
    (n, g) => n + Object.entries(g.taggedAs).reduce((m, [tag, c]) => (tag === g.problem ? m : m + c), 0),
    0,
  );
}
