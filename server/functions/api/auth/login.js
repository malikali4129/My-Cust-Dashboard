import { ensureDefaultAdmin, getAdmins, getSecret, hashPassword, signToken, logActivity } from '../_auth.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  await ensureDefaultAdmin(env);
  
  const body = await request.json();
  const { username, password } = body;
  
  const admins = await getAdmins(env);
  const admin = admins.find(a => a.username === username);
  
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  
  const passwordHash = await hashPassword(password, admin.salt);
  if (passwordHash !== admin.passwordHash) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  
  const secret = await getSecret(env);
  const token = await signToken({ 
    adminId: admin.id, 
    username: admin.username, 
    role: admin.role 
  }, secret);
  
  await logActivity(env, 'LOGIN', 'auth', admin.id, admin.username, {});
  
  return new Response(JSON.stringify({ 
    token, 
    admin: { id: admin.id, username: admin.username, role: admin.role } 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
