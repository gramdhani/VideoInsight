import { db } from "./db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";

async function seedAdmins() {
  const ids = process.env.ADMIN_USER_IDS?.split(",").filter(Boolean) || [];
  if (ids.length === 0) {
    console.log("No ADMIN_USER_IDS provided");
    return;
  }
  await db.update(users).set({ isAdmin: true }).where(inArray(users.id, ids));
  console.log(`Seeded ${ids.length} admin user(s)`);
}

seedAdmins()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
