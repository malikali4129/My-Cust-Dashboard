import { requireAuth, logActivity } from './_auth.js';

export async function onRequestPost(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const { env, request } = context;
  try {
    const body = await request.json();
    if (!body.config || !body.data) {
      return new Response(JSON.stringify({ error: 'Invalid format: must include config and data' }), { status: 400 });
    }
    await env.DATA.put('config', JSON.stringify(body.config));
    for (const [key, value] of Object.entries(body.data)) {
      await env.DATA.put(`data:${key}`, JSON.stringify(value));
    }
    await logActivity(env, 'IMPORT_DATA', 'import', admin.id, admin.username, { categoryCount: Object.keys(body.data).length });
    return new Response(JSON.stringify({ success: true, message: 'Data imported successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
