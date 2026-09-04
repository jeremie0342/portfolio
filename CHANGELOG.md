# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Next.js 16 application with the App Router, React 19 and the React
  Compiler enabled.
- Archive Nocturne design tokens, split into fixed pigments and themeable
  roles, with a dark and a light theme resolved before first paint.
- Self-hosted typographic system: Redaction for display, Author for reading,
  Sligoil for archive punctuation.
- English and French localisation with prefixed routes, per-locale metadata
  and alternate language tags.
- Prisma schema for the archive: a single numbered entry with satellite
  tables for projects, worlds, credentials and positions, and dedicated
  translation tables.
- Proof sheet page used to judge the art direction against real type and
  real contrast ratios.

### Notes

- ESLint is held at 9.x. The 10.x release breaks `eslint-plugin-react` as
  bundled by `eslint-config-next`.
- TypeScript is held at 5.9 for the peer range declared by
  `typescript-eslint`.
