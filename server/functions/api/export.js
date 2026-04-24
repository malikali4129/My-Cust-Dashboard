export async function onRequestGet(context) {
  const { env } = context;
  try {
    const config = await env.DATA.get('config', { type: 'json' });
    if (!config) {
      return new Response(JSON.stringify({ error: 'No config found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const exportData = {
      config,
      data: {},
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    for (const cat of config.categories) {
      const items = await env.DATA.get(`data:${cat.id}`, { type: 'json' });
      exportData.data[cat.id] = items || [];
    }
    
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="dashboard-backup.json"'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
