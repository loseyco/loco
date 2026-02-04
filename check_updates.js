async function checkUpdates() {
  const url = 'https://jxnqsbkvckvfwgmvuajb.supabase.co/rest/v1';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  const tables = ['activity_logs', 'tasks', 'invoices', 'expenses', 'project_notes', 'time_entries'];
  const results = {};

  for (const table of tables) {
    try {
      const response = await fetch(`${url}/${table}?created_at=gt.${oneHourAgo}&select=*`, { headers });
      results[table] = await response.json();
    } catch (e) {
      results[table] = { error: e.message };
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

checkUpdates();
