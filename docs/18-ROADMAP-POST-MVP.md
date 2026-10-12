# 18 — Neobvezna prihodnja razširitev (ni del MVP)

Izvedi šele po dokončanju M0–M8; vsaka razširitev zahteva nov ADR, model/contract update, test in oceno vpliva na licenco.

## Opcija A — Zgodovina napovedi in backtesting
- Shranjevanje backtest rezultatov, Brier score, calibration chart in primerjava baseline modela skozi sezone.
- Pomembno: prihodnjih izidov ni dovoljeno vključiti v zgodovinske napovedi.

## Opcija B — Personalizacija
- Priljubljene ekipe, shranjene tekme, nastavitve grafov; šele tukaj razmisli o Supabase Auth + PostgreSQL.

## Opcija C — Advanced goalie analytics
- Poseben goalie game-level MoneyPuck CSV, GSAx in primerjave vratarjev.
- Obvezna pravilna identifikacija goalie in situation, atribucija, brez napačnega sklepanja iz team-level CSV.

## Opcija D — Boljši statistični model
- Test empiric league-average, recency decay, home/away multiyear smoothing in boljšo distribucijo SOG.
- Poskusi z ML šele po poštenem walk-forward eval + baseline.

## Opcija E — Živi prikaz
- Pameten polling NHL, označeno zadnje osveževanje, pravilna omejitev zahtev, brez obljube uradnega real-time feeda.

**Načelo:** najprej zanesljiv MVP integracije, šele nato dodatne funkcionalnosti.
