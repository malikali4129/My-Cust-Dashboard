export async function onRequestGet(context) {
  const { env, params } = context;
  const category = params.category;
  try {
    const items = await env.DATA.get(`data:${category}`, { type: 'json' });
    return new Response(JSON.stringify(items || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { env, params, request } = context;
  const category = params.category;
  try {
    const body = await request.json();
    const items = await env.DATA.get(`data:${category}`, { type: 'json' }) || [];
    
    const newItem = {
      id: crypto.randomUUID(),
      title: body.title || '',
      content: body.content || '',
      status: body.status || 'active',
      priority: body.priority || 'medium',
      date: body.date || new Date().toISOString(),
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map(t => t.trim()).filter(Boolean) : [])
    };
    
    items.push(newItem);
    await env.DATA.put(`data:${category}`, JSON.stringify(items));
    
    return new Response(JSON.stringify(newItem), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const category = params.category;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await request.json();
    const items = await env.DATA.get(`data:${category}`, { type: 'json' }) || [];
    const index = items.findIndex(i => i.id === id);
    
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const updatedItem = {
      ...items[index],
      ...body,
      id: items[index].id // prevent id change
    };
    
    if (body.tags !== undefined) {
      updatedItem.tags = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => t.trim()).filter(Boolean);
    }
    
    items[index] = updatedItem;
    await env.DATA.put(`data:${category}`, JSON.stringify(items));
    
    return new Response(JSON.stringify(updatedItem), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  const { env, params, request } = context;
  const category = params.category;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const items = await env.DATA.get(`data:${category}`, { type: 'json' }) || [];
    const filtered = items.filter(i => i.id !== id);
    
    if (filtered.length === items.length) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await env.DATA.put(`data:${category}`, JSON.stringify(filtered));
    
    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
