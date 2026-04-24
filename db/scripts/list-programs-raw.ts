import postgres from 'postgres';

const sql = postgres("postgresql://neondb_owner:npg_Y5Ziw7CyhVtr@ep-nameless-term-a4zfifrr-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function main() {
  const programs = await sql`SELECT id, name, type FROM program`;
  console.log(JSON.stringify(programs, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
