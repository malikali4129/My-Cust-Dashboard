import { requireAuth } from '../_auth.js';

export async function onRequestGet(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  return new Response(JSON.stringify({ 
    admin: { 
      id: admin.id, 
      username: admin.username, 
      role: admin.role 
    } 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
