# kb — the support knowledge base

> **This repo** is the support desk's kb export with one page added, for MEGA.dev Challenge
> S01E03 ("what it shows"). Ticket #4471 merged 412 reports as one problem. Read by tenant, it
> holds three. Each has its own ticket here, in this repo's issues, with the reports it covers.
>
> - The page: [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx),
>   signed in its frontmatter and stamped with its desk ref.
> - The page as the desk sees it: [`rendered/kb-incidents-4471-split.html`](rendered/kb-incidents-4471-split.html).
> - The logic behind its table: [`src/lib/kb/split.ts`](src/lib/kb/split.ts) and
>   [`src/lib/kb/TicketSplit.svelte`](src/lib/kb/TicketSplit.svelte); the ticket links it shows live in
>   [`src/lib/data/tickets-4471.json`](src/lib/data/tickets-4471.json).
> - The export came without a build. `package.json`, `svelte.config.js` and `vite.config.ts` wrap it in
>   SvelteKit + mdsvex so it renders: `pnpm install && pnpm run render`.
>
> The tickets are listed in the page's table and under [Issues](../../issues).

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
