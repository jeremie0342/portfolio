/**
 * Technical skills, grouped.
 *
 * Taken from the curriculum vitae rather than assembled from what the
 * repositories happen to import: a dependency in a lock file is not a skill,
 * and the list should say what its author is willing to be asked about.
 *
 * Group labels are translated; the entries themselves are proper nouns and
 * stay as they are in both languages.
 */
export const skills = [
  {
    key: "languages",
    items: ["TypeScript", "Python", "Rust", "JavaScript", "Kotlin", "C#"],
  },
  {
    key: "frontend",
    items: ["Next.js", "React", "React Native", "Vue 3", "Svelte", "Tailwind CSS"],
  },
  {
    key: "backend",
    items: ["Django", "DRF", "FastAPI", "Express", "NestJS", "Axum", "gRPC", "Celery"],
  },
  { key: "data", items: ["PostgreSQL", "MongoDB", "Redis", "MinIO"] },
  {
    key: "infrastructure",
    items: ["Docker", "GitHub Actions", "GitLab CI", "Nginx", "Ubuntu", "Coolify", "Vercel", "Hetzner"],
  },
  {
    key: "observability",
    items: ["PostHog", "Sentry", "Grafana", "Loki", "Prometheus"],
  },
  {
    key: "security",
    items: ["JWT", "NextAuth v5", "better-auth", "OAuth", "2FA", "RBAC", "Turnstile"],
  },
  { key: "payments", items: ["Stripe", "FedaPay", "PayPal"] },
  {
    key: "ai",
    items: ["Claude", "Gemini", "Qwen", "embeddings", "RAG", "tree-sitter"],
  },
] as const;
