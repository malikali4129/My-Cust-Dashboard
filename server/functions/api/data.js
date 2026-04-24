export async function onRequestGet(context) {
  const { env } = context;
  try {
    const config = await env.DATA.get('config', { type: 'json' });
    if (!config) {
      return new Response(JSON.stringify({ config: { categories: [] }, data: {} }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = {};
    for (const cat of config.categories) {
      const items = await env.DATA.get(`data:${cat.id}`, { type: 'json' });
      data[cat.id] = items || [];
    }
    
    return new Response(JSON.stringify({ config, data }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
