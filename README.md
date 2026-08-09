# ores-otel-log-browser-test

Exact-head conformance harness for **browser**.

This repository tests both `ores-otel/ores.otel.log` and `ORESoftware/next-loggers.ts` using explicit commit SHAs.
The required native command is recorded in `conformance.json`: `npm ci && npm run test:browser && npm run test:workerd`.
