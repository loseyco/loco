import { NextResponse } from 'next/server';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres:KN4IBpHwtqF9dwwp@db.jxnqsbkvckvfwgmvuajb.supabase.co:5432/postgres';

export async function GET() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM api_usage ORDER BY recorded_at DESC LIMIT 50");
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
