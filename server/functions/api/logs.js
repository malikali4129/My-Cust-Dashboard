import { requireAuth } from './_auth.js';

export async function onRequestGet(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const url = new URL(context.request.url);
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const action = url.searchParams.get('action') || '';
  
  let logs = await context.env.DATA.get('logs:activity', { type: 'json' }) || [];
  
  if (action) {
    logs = logs.filter(l => l.action === action);
  }
  
  logs = logs.slice(0, Math.min(limit, 500));
  
  return new Response(JSON.stringify({ logs, count: logs.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
