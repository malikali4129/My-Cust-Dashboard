export async function onRequestGet(context) {
  const { env } = context;
  try {
    const config = await env.DATA.get('config', { type: 'json' }) || { categories: [] };
    const result = { config, data: {} };
    for (const cat of config.categories) {
      result.data[cat.id] = await env.DATA.get(`data:${cat.id}`, { type: 'json' }) || [];
    }
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
