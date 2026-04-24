import { requireAuth, logActivity } from './_auth.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const category = params.category;
  try {
    const items = await env.DATA.get(`data:${category}`, { type: 'json' }) || [];
    return new Response(JSON.stringify(items), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
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
      tags: body.tags || []
    };
    items.push(newItem);
    await env.DATA.put(`data:${category}`, JSON.stringify(items));
    await logActivity(env, 'CREATE_ITEM', `${category}:${newItem.id}`, admin.id, admin.username, { title: newItem.title, category });
    return new Response(JSON.stringify(newItem), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPut(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const { env, params, request } = context;
  const category = params.category;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  try {
    const body = await request.json();
    const items = await env.DATA.get(`data:${category}`, { type: 'json' }) || [];
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const oldTitle = items[index].title;
    items[index] = { ...items[index], ...body, id: items[index].id };
    await env.DATA.put(`data:${category}`, JSON.stringify(items));
    await logActivity(env, 'UPDATE_ITEM', `${category}:${id}`, admin.id, admin.username, { title: items[index].title, category, oldTitle });
    return new Response(JSON.stringify(items[index]), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const { env, params, request } = context;
  const category = params.category;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  try {
    const items = await env.DATA.get(`data:${category}`, { type: 'json' }) || [];
    const target = items.find(i => i.id === id);
    if (!target) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const filtered = items.filter(i => i.id !== id);
    await env.DATA.put(`data:${category}`, JSON.stringify(filtered));
    await logActivity(env, 'DELETE_ITEM', `${category}:${id}`, admin.id, admin.username, { title: target.title, category });
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
