<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { mistagged, splitByProblem, type Problem } from '#lib/kb/split';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const groups = $derived(splitByProblem(merged, tenantOf, notes.oneDayMove));
  const wrongTags = $derived(mistagged(groups));

  const NAME: Record<Problem, string> = {
    parser: 'month and day flipped: the shared parser reads month first',
    hint: 'month and day flipped: booking-v3 asks for MM/DD/YYYY, then reads day first',
    'one-day-move': 'date moves by one day',
    unplaced: 'no tenant on file',
  };
  type Ticket = { url: string; state: 'open' | 'closed'; resolution: string | null };
  const issueOf = (p: Problem): Ticket | null => (tickets.tickets as Record<string, Ticket | undefined>)[p] ?? null;
  const issueNo = (url: string) => `#${url.split('/').pop()}`;
  const open = $derived(groups.filter((g) => issueOf(g.problem)?.state !== 'closed'));
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{rows.length}</strong> rows in the export · <strong>{merged.length}</strong> reports once each id counts once ·
  <strong>{groups.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = issueOf(g.problem)}
      <tr class:open={t?.state !== 'closed'}>
        <td><code>{g.problem}</code><br /><span class="what">{NAME[g.problem]}</span></td>
        <td class="n">{g.reports.length}</td>
        <td>{g.tenants.length}</td>
        <td class="tags">{list(g.channels)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.url}>{issueNo(t.url)}</a>{:else}<span class="missing">not filed yet</span>{/if}</td>
        <td class="state">{#if !t}—{:else if t.state === 'closed'}closed · {t.resolution}{:else}<strong>open</strong>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="sum">
  Desk closed #{ticket} on {tickets.deskClosed} ·
  <strong>{open.length}</strong> of {groups.length} problems still open, covering
  <strong>{open.reduce((n, g) => n + g.reports.length, 0)}</strong> reports
</p>

<p class="note">
  Intake's tag got <strong>{wrongTags}</strong> of {merged.length} reports wrong, because it guesses from the reporter's
  browser and the problem depends on the tenant:
  {#each groups as g, i (g.problem)}{i ? '; ' : ''}<code>{g.problem}</code> was tagged {list(g.taggedAs)}{/each}.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .n { font-weight: 600; }
  .what { color: var(--muted); font-size: 0.85em; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .missing { color: var(--warn); }
  .state { font-size: 0.85em; color: var(--muted); }
  .open td { background: var(--warn-bg); }
  .open .state strong { color: var(--warn); }
</style>
