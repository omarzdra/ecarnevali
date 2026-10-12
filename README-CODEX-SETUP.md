# HockeyStats — kako vključiti dokumentacijo

**Namen:** ta paket vsebuje specifikacije, navodila za Codex in projektne skills. **Ne vsebuje izdelane aplikacije.**

1. Vsebino ZIP-a kopiraj **v koren** obstoječega GitHub repozitorija HockeyStats. Mapi `docs/` in `.agents/` ter datoteko `AGENTS.md` ohrani na ustreznih mestih; ne vstavljaj vsega v `docs/`.
2. Če `AGENTS.md` že obstaja, navodila **združi** (ne prepiši svojih projektnih pravil).
3. Začni v korenu projekta, odpri Codex, in mu pošlji spodnji prompt.
4. Naj implementira **M0/M1**, nato preglej `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; nadaljuj z naslednjim mejnikom.
5. Imena obstoječih map ali paketov lahko odstopajo. Codex mora pred posegom pregledati repo in prilagoditi strukturo, ne podvajati že obstoječega.

### Prvi prompt (kopiraj v Codex)

```text
Preglej AGENTS.md in docs/README.md ter relevantne specifikacije. Najprej preglej dejansko stanje mojega repozitorija. Izvedi samo M0 in M1 iz docs/11-MILESTONES.md: postavitev npm workspaces, osnovni React/Vite/TS frontend, Express/TS backend, skupne tipe, env predlogo in osnovne ukaze ter teste. Ne implementiraj MoneyPuck ali predictions v tej fazi. Poročaj o spremembah, zagnanih preverjanjih in ovirah. Ne označi nepreverjenih zunanjih endpointov kot potrjenih.
```

### Kateri dokument je primaren?
- `AGENTS.md`: stalna pravila za vsako Codex nalogo.
- `docs/README.md`: kazalo in vrstni red branja.
- `docs/05-DATA-CONTRACTS.md` in `docs/06-API-CONTRACT.md`: definicije javne pogodbe; ob spremembi ju posodobi skupaj.
- `docs/11-MILESTONES.md`: obseg in zaporedje funkcij.
- `.agents/skills/*/SKILL.md`: namenski postopki, ne nadomestijo pogodbe v `/docs`.

Vir podatkov in pravice uporabe so razložene v `docs/15-SOURCES.md`.
