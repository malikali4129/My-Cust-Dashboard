export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const body = await request.json();
    
    if (!body.config || !body.data || typeof body.data !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid format: must include config object and data object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!body.config.categories || !Array.isArray(body.config.categories)) {
      return new Response(JSON.stringify({ error: 'Invalid config: categories array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Write config
    await env.DATA.put('config', JSON.stringify(body.config));
    
    // Write all category data
    for (const [key, value] of Object.entries(body.data)) {
      if (Array.isArray(value)) {
        await env.DATA.put(`data:${key}`, JSON.stringify(value));
      }
    }

    // Write history data if present
    if (body.history && typeof body.history === 'object') {
      for (const [key, value] of Object.entries(body.history)) {
        if (Array.isArray(value)) {
          await env.DATA.put(`history:${key}`, JSON.stringify(value));
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Data imported successfully',
      categoriesRestored: body.config.categories.length 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
