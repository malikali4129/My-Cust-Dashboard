import { requireAuth, logActivity } from './_auth.js';

export async function onRequestGet(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const { env } = context;
  try {
    const config = await env.DATA.get('config', { type: 'json' }) || { categories: [] };
    const exportData = { config, data: {}, exportedAt: new Date().toISOString() };
    for (const cat of config.categories) {
      exportData.data[cat.id] = await env.DATA.get(`data:${cat.id}`, { type: 'json' }) || [];
    }
    await logActivity(env, 'EXPORT_DATA', 'export', admin.id, admin.username, { categoryCount: config.categories.length });
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="dashboard-backup.json"'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
