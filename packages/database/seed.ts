import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";
import * as crypto from "crypto";
import { eq } from "drizzle-orm";

const db = drizzle(env.DATABASE_URL, { schema });

// Simple bcrypt-compatible hash using Node crypto (for seed only)
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const themes = [
  {
    name: "Neon Noir",
    slug: "neon-noir",
    description: "Cyberpunk dark theme with neon accents — perfect for gaming and tech forms",
    category: "gaming",
    primaryColor: "#00f5ff",
    backgroundColor: "#0a0a1a",
    textColor: "#e2e8f0",
    accentColor: "#7c3aed",
    cardColor: "#111128",
    fontFamily: "Space Grotesk",
    borderRadius: "sm",
    gradientConfig: { from: "#0a0a1a", to: "#1a0a2e", angle: 135 },
  },
  {
    name: "Anime Sakura",
    slug: "anime-sakura",
    description: "Soft pink Japanese aesthetic inspired by cherry blossom season",
    category: "anime",
    primaryColor: "#ec4899",
    backgroundColor: "#fff0f7",
    textColor: "#831843",
    accentColor: "#f472b6",
    cardColor: "#fdf2f8",
    fontFamily: "Nunito",
    borderRadius: "xl",
    gradientConfig: { from: "#fce7f3", to: "#fff0f7", angle: 180 },
  },
  {
    name: "Startup Blue",
    slug: "startup-blue",
    description: "Clean, professional blue theme for SaaS products and tech companies",
    category: "startup",
    primaryColor: "#3b82f6",
    backgroundColor: "#f8faff",
    textColor: "#1e3a5f",
    accentColor: "#6366f1",
    cardColor: "#ffffff",
    fontFamily: "Inter",
    borderRadius: "md",
    gradientConfig: { from: "#eff6ff", to: "#f8faff", angle: 160 },
  },
  {
    name: "Matrix Terminal",
    slug: "matrix-terminal",
    description: "Green-on-black developer aesthetic — for the builders and hackers",
    category: "developer",
    primaryColor: "#00ff41",
    backgroundColor: "#000000",
    textColor: "#00ff41",
    accentColor: "#39ff14",
    cardColor: "#0a0a0a",
    fontFamily: "JetBrains Mono",
    borderRadius: "none",
    gradientConfig: { from: "#000000", to: "#001a00", angle: 180 },
  },
  {
    name: "Sunset Cinema",
    slug: "sunset-cinema",
    description: "Warm amber and crimson — inspired by old Hollywood and classic films",
    category: "movies",
    primaryColor: "#f59e0b",
    backgroundColor: "#1c1410",
    textColor: "#fef3c7",
    accentColor: "#ef4444",
    cardColor: "#241c14",
    fontFamily: "Playfair Display",
    borderRadius: "sm",
    gradientConfig: { from: "#1c1410", to: "#2d1b0e", angle: 135 },
  },
  {
    name: "Midnight OS",
    slug: "midnight-os",
    description: "Sleek gray slate inspired by modern operating systems",
    category: "os",
    primaryColor: "#64748b",
    backgroundColor: "#0f172a",
    textColor: "#e2e8f0",
    accentColor: "#38bdf8",
    cardColor: "#1e293b",
    fontFamily: "IBM Plex Sans",
    borderRadius: "md",
    gradientConfig: { from: "#0f172a", to: "#1e293b", angle: 180 },
  },
  {
    name: "Festival Neon",
    slug: "festival-neon",
    description: "Vivid multi-color gradient for events, communities, and celebrations",
    category: "events",
    primaryColor: "#a855f7",
    backgroundColor: "#09090b",
    textColor: "#fafafa",
    accentColor: "#06b6d4",
    cardColor: "#18181b",
    fontFamily: "Outfit",
    borderRadius: "lg",
    gradientConfig: { from: "#09090b", to: "#1a0930", angle: 135 },
  },
  {
    name: "Ocean Breeze",
    slug: "ocean-breeze",
    description: "Calm teal and white — clean minimal design inspired by the sea",
    category: "minimal",
    primaryColor: "#14b8a6",
    backgroundColor: "#f0fdfa",
    textColor: "#134e4a",
    accentColor: "#06b6d4",
    cardColor: "#ffffff",
    fontFamily: "DM Sans",
    borderRadius: "lg",
    gradientConfig: { from: "#f0fdfa", to: "#e6fffa", angle: 160 },
  },
];

const sampleForms = [
  {
    title: "Dev Conference 2025 RSVP",
    description: "Join us for the biggest developer conference of the year! Register your spot now.",
    themeSlug: "festival-neon",
    visibility: "public" as const,
    status: "published" as const,
    isTemplate: false,
    submitMessage: "You're in! 🎉 We'll send confirmation details to your email.",
    fields: [
      { type: "text" as const, label: "Full Name", placeholder: "John Doe", required: true, order: 0 },
      { type: "email" as const, label: "Email Address", placeholder: "john@example.com", required: true, order: 1 },
      { type: "select" as const, label: "Which track interests you most?", required: true, order: 2, options: [
        { label: "Frontend & UI", value: "frontend" },
        { label: "Backend & APIs", value: "backend" },
        { label: "DevOps & Cloud", value: "devops" },
        { label: "AI & ML", value: "ai" },
        { label: "Security", value: "security" },
      ]},
      { type: "radio" as const, label: "T-shirt size", required: true, order: 3, options: [
        { label: "S", value: "s" }, { label: "M", value: "m" }, { label: "L", value: "l" }, { label: "XL", value: "xl" }
      ]},
      { type: "textarea" as const, label: "Any dietary restrictions or accessibility needs?", required: false, order: 4, placeholder: "Let us know so we can accommodate you" },
      { type: "checkbox" as const, label: "I agree to the Code of Conduct", required: true, order: 5 },
    ],
  },
  {
    title: "Favorite Anime Character Poll",
    description: "Vote for your all-time favorite anime character and tell us why you love them!",
    themeSlug: "anime-sakura",
    visibility: "public" as const,
    status: "published" as const,
    isTemplate: false,
    submitMessage: "Thanks for voting! Results will be shared at the end of the month. 🌸",
    fields: [
      { type: "text" as const, label: "Your Name (or pseudonym)", placeholder: "SakuraFan99", required: false, order: 0 },
      { type: "select" as const, label: "Favorite anime character", required: true, order: 1, options: [
        { label: "Goku (Dragon Ball Z)", value: "goku" },
        { label: "Naruto Uzumaki (Naruto)", value: "naruto" },
        { label: "Levi Ackerman (Attack on Titan)", value: "levi" },
        { label: "Itachi Uchiha (Naruto)", value: "itachi" },
        { label: "Light Yagami (Death Note)", value: "light" },
        { label: "Edward Elric (FMA Brotherhood)", value: "edward" },
        { label: "Other", value: "other" },
      ]},
      { type: "rating" as const, label: "How would you rate that anime overall?", required: true, order: 2, ratingConfig: { maxRating: 5, icon: "star" as const } },
      { type: "textarea" as const, label: "Why is this character your favorite?", required: false, order: 3, placeholder: "Tell us the story..." },
    ],
  },
  {
    title: "SaaS Product Feedback Survey",
    description: "Help us improve ChaiForm by sharing your experience. Your feedback shapes our roadmap.",
    themeSlug: "startup-blue",
    visibility: "public" as const,
    status: "published" as const,
    isTemplate: true,
    submitMessage: "Thank you! Your feedback is invaluable to our team. 💙",
    fields: [
      { type: "email" as const, label: "Your email (optional for follow-up)", placeholder: "you@company.com", required: false, order: 0 },
      { type: "rating" as const, label: "How would you rate your overall experience?", required: true, order: 1, ratingConfig: { maxRating: 5, icon: "star" as const } },
      { type: "select" as const, label: "Which feature do you use most?", required: true, order: 2, options: [
        { label: "Form Builder", value: "builder" },
        { label: "Analytics", value: "analytics" },
        { label: "Themes", value: "themes" },
        { label: "API Access", value: "api" },
        { label: "Response Export", value: "export" },
      ]},
      { type: "select" as const, label: "How likely are you to recommend us?", required: true, order: 3, options: [
        { label: "Very Likely", value: "5" },
        { label: "Likely", value: "4" },
        { label: "Neutral", value: "3" },
        { label: "Unlikely", value: "2" },
        { label: "Very Unlikely", value: "1" },
      ]},
      { type: "textarea" as const, label: "What feature would you most like to see added?", required: false, order: 4, placeholder: "Your idea here..." },
    ],
  },
  {
    title: "Job Application — Senior Engineer",
    description: "Apply for our Senior Full-Stack Engineer position. We review all applications within 5 business days.",
    themeSlug: "midnight-os",
    visibility: "unlisted" as const,
    status: "published" as const,
    isTemplate: false,
    submitMessage: "Application received! We'll be in touch soon. 🚀",
    fields: [
      { type: "text" as const, label: "Full Name", placeholder: "Jane Smith", required: true, order: 0 },
      { type: "email" as const, label: "Email Address", placeholder: "jane@example.com", required: true, order: 1 },
      { type: "url" as const, label: "LinkedIn Profile", placeholder: "https://linkedin.com/in/...", required: false, order: 2 },
      { type: "url" as const, label: "GitHub Profile", placeholder: "https://github.com/...", required: false, order: 3 },
      { type: "number" as const, label: "Years of experience", required: true, order: 4, validations: { min: 0, max: 50 } },
      { type: "multiselect" as const, label: "Tech stack (select all you know)", required: true, order: 5, options: [
        { label: "TypeScript", value: "ts" }, { label: "React", value: "react" },
        { label: "Node.js", value: "node" }, { label: "PostgreSQL", value: "postgres" },
        { label: "AWS", value: "aws" }, { label: "Docker", value: "docker" },
      ]},
      { type: "textarea" as const, label: "Why do you want to join our team?", required: true, order: 6, placeholder: "Tell us about yourself and your motivation..." },
    ],
  },
  {
    title: "Indie Game Jam Entry Form",
    description: "Submit your game for the 48-hour Game Jam! All genres welcome — from platformers to horror.",
    themeSlug: "neon-noir",
    visibility: "public" as const,
    status: "published" as const,
    isTemplate: false,
    submitMessage: "Entry submitted! Good luck, developer! 🎮",
    fields: [
      { type: "text" as const, label: "Game Title", placeholder: "My Awesome Game", required: true, order: 0 },
      { type: "text" as const, label: "Team Name", placeholder: "Team Pixel", required: true, order: 1 },
      { type: "email" as const, label: "Contact Email", required: true, order: 2, placeholder: "team@example.com" },
      { type: "select" as const, label: "Game Genre", required: true, order: 3, options: [
        { label: "Platformer", value: "platformer" }, { label: "Puzzle", value: "puzzle" },
        { label: "Horror", value: "horror" }, { label: "RPG", value: "rpg" },
        { label: "Simulation", value: "sim" }, { label: "Other", value: "other" },
      ]},
      { type: "select" as const, label: "Engine Used", required: true, order: 4, options: [
        { label: "Unity", value: "unity" }, { label: "Unreal Engine", value: "unreal" },
        { label: "Godot", value: "godot" }, { label: "Phaser.js", value: "phaser" }, { label: "Other", value: "other" },
      ]},
      { type: "url" as const, label: "Gameplay Video Link", placeholder: "https://youtube.com/...", required: false, order: 5 },
      { type: "textarea" as const, label: "Game Description (100-300 words)", required: true, order: 6, placeholder: "Describe your game concept, mechanics and story...", validations: { minLength: 50, maxLength: 1000 } },
      { type: "rating" as const, label: "How fun was the game jam experience?", required: false, order: 7, ratingConfig: { maxRating: 5, icon: "star" as const } },
    ],
  },
  {
    title: "Classic Movie Ratings Survey",
    description: "Rate your favorite classic films! Help us build the ultimate vintage cinema database.",
    themeSlug: "sunset-cinema",
    visibility: "public" as const,
    status: "published" as const,
    isTemplate: true,
    submitMessage: "Lights, camera, thank you! 🎬 Your ratings have been recorded.",
    fields: [
      { type: "text" as const, label: "Your name or username", placeholder: "CinemaLover42", required: false, order: 0 },
      { type: "select" as const, label: "Favorite decade of cinema", required: true, order: 1, options: [
        { label: "1950s", value: "1950s" }, { label: "1960s", value: "1960s" },
        { label: "1970s", value: "1970s" }, { label: "1980s", value: "1980s" },
        { label: "1990s", value: "1990s" },
      ]},
      { type: "rating" as const, label: "The Godfather (1972)", required: false, order: 2, ratingConfig: { maxRating: 5, icon: "star" as const } },
      { type: "rating" as const, label: "Pulp Fiction (1994)", required: false, order: 3, ratingConfig: { maxRating: 5, icon: "star" as const } },
      { type: "rating" as const, label: "2001: A Space Odyssey (1968)", required: false, order: 4, ratingConfig: { maxRating: 5, icon: "star" as const } },
      { type: "textarea" as const, label: "Which film do you think is criminally underrated?", required: false, order: 5, placeholder: "Title and your thoughts..." },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding ChaiForm database...");

  // 1. Seed themes
  console.log("🎨 Seeding themes...");
  const insertedThemes = await db
    .insert(schema.themesTable)
    .values(themes)
    .onConflictDoNothing()
    .returning();

  const themeMap = new Map<string, string>();
  for (const t of insertedThemes) themeMap.set(t.slug, t.id);
  // Fetch existing themes too (in case of conflict)
  const allThemes = await db.select().from(schema.themesTable);
  for (const t of allThemes) themeMap.set(t.slug, t.id);

  console.log(`✅ ${themeMap.size} themes ready`);

  // 2. Seed demo user
  console.log("👤 Seeding demo user...");
  const [existingUser] = await db
    .select()
    .from(schema.usersTable)
    .where(eq(schema.usersTable.email, "demo@chaiForm.dev"))
    .limit(1);

  let demoUserId: string;

  if (existingUser) {
    demoUserId = existingUser.id;
    console.log("  Demo user already exists, skipping");
  } else {
    const [demoUser] = await db
      .insert(schema.usersTable)
      .values({
        fullName: "Demo Creator",
        email: "demo@chaiForm.dev",
        emailVerified: true,
        profileImageUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=chaiForm",
      })
      .returning();
    demoUserId = demoUser.id;

    const passwordHash = await hashPassword("demo1234");
    await db.insert(schema.passwordsTable).values({
      userId: demoUserId,
      hash: passwordHash,
    });
    console.log("  ✅ Demo user created: demo@chaiForm.dev / demo1234");
  }

  // 3. Seed forms
  console.log("📋 Seeding sample forms...");
  for (const formDef of sampleForms) {
    const { fields, themeSlug, ...formData } = formDef;

    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Math.random().toString(36).slice(2, 6);

    const themeId = themeMap.get(themeSlug);

    const [existing] = await db
      .select()
      .from(schema.formsTable)
      .where(eq(schema.formsTable.title, formData.title))
      .limit(1);

    if (existing) {
      console.log(`  Skipping "${formData.title}" — already exists`);
      continue;
    }

    const [form] = await db
      .insert(schema.formsTable)
      .values({
        userId: demoUserId,
        themeId: themeId ?? null,
        slug,
        ...formData,
      })
      .returning();

    // Insert fields
    if (fields.length > 0) {
      await db.insert(schema.fieldsTable).values(
        fields.map((f) => ({ formId: form.id, ...f }))
      );
    }

    // Seed some fake responses
    const responseCount = Math.floor(Math.random() * 40) + 10;
    const fakeResponses = Array.from({ length: responseCount }, (_, i) => {
      const answers: Record<string, string | number> = {};
      for (const field of fields) {
        if (field.type === "text" || field.type === "textarea") {
          answers[field.label] = `Sample response ${i + 1}`;
        } else if (field.type === "email") {
          answers[field.label] = `user${i + 1}@example.com`;
        } else if (field.type === "number") {
          answers[field.label] = Math.floor(Math.random() * 10) + 1;
        } else if (field.type === "rating") {
          answers[field.label] = Math.floor(Math.random() * 5) + 1;
        } else if (field.type === "select" || field.type === "radio") {
          const opts = field.options ?? [];
          answers[field.label] = opts[Math.floor(Math.random() * opts.length)]?.value ?? "option1";
        } else if (field.type === "checkbox") {
          answers[field.label] = "true";
        } else if (field.type === "url") {
          answers[field.label] = "https://example.com";
        }
      }
      return {
        formId: form.id,
        answers,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        completionTimeSeconds: Math.floor(Math.random() * 180) + 30,
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      };
    });

    await db.insert(schema.responsesTable).values(fakeResponses);
    console.log(`  ✅ "${form.title}" — ${fields.length} fields, ${responseCount} responses`);
  }

  console.log("\n✨ Seeding complete!");
  console.log("\n📌 Demo Credentials:");
  console.log("   Email:    demo@chaiForm.dev");
  console.log("   Password: demo1234");
  console.log("\n🌍 Public forms visible at /explore");
  console.log("🔐 Dashboard at /dashboard\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
