import process from "node:process";

const required = [
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "APP_URL",
  "INTERNAL_CRON_SECRET",
];

const missing = required.filter(
  (key) => !process.env[key] || !process.env[key].trim(),
);

if (missing.length) {
  console.error("Missing required environment variables:");
  for (const key of missing) console.error(`- ${key}`);
  process.exit(1);
}

if (!/^https?:\/\//.test(process.env.APP_URL)) {
  console.error("APP_URL must begin with http:// or https://");
  process.exit(1);
}

console.log("Environment validation passed.");
