const DEFAULT_CONFIG = {
  categories: [
    { id: 'announcements', label: 'Announcements', icon: 'megaphone', color: 'indigo' },
    { id: 'assignments', label: 'Pending Assignments', icon: 'clipboard-list', color: 'amber' },
    { id: 'tasks', label: 'Tasks', icon: 'check-circle', color: 'emerald' }
  ]
};

import { requireAuth, logActivity } from './_auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const config = await env.DATA.get('config', { type: 'json' });
    if (!config) {
      await env.DATA.put('config', JSON.stringify(DEFAULT_CONFIG));
      return new Response(JSON.stringify(DEFAULT_CONFIG), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify(config), {
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
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const { env, request } = context;
  try {
    const body = await request.json();
    if (!body.categories || !Array.isArray(body.categories)) {
      return new Response(JSON.stringify({ error: 'Invalid config: categories array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    await env.DATA.put('config', JSON.stringify(body));
    await logActivity(env, 'UPDATE_CONFIG', 'config', admin.id, admin.username, { categoryCount: body.categories.length });
    return new Response(JSON.stringify({ success: true, config: body }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
