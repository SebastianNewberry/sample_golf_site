import { db } from "../index";
import { program } from "../schema";

async function main() {
  const allPrograms = await db.select().from(program);
  console.log(JSON.stringify(allPrograms, null, 2));
  process.exit(0);
}

main();
