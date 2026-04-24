import { requireAuth, requireSuperAdmin, getAdmins, getSecret, generateSalt, hashPassword, signToken, logActivity } from './_auth.js';

export async function onRequestGet(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return error;
  
  const admins = await getAdmins(context.env);
  return new Response(JSON.stringify(admins.map(a => ({
    id: a.id,
    username: a.username,
    role: a.role,
    createdAt: a.createdAt
  }))), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { admin, error } = await requireSuperAdmin(context);
  if (error) return error;
  
  const body = await context.request.json();
  const { username, password, role = 'admin' } = body;
  
  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Username and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const admins = await getAdmins(context.env);
  if (admins.find(a => a.username === username)) {
    return new Response(JSON.stringify({ error: 'Username already exists' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const newAdmin = {
    id: crypto.randomUUID(),
    username,
    passwordHash,
    salt,
    role,
    createdAt: new Date().toISOString()
  };
  
  admins.push(newAdmin);
  await context.env.DATA.put('auth:admins', JSON.stringify(admins));
  
  await logActivity(context.env, 'CREATE_ADMIN', `admin:${newAdmin.id}`, admin.id, admin.username, { targetUsername: username, targetRole: role });
  
  return new Response(JSON.stringify({ 
    id: newAdmin.id,
    username: newAdmin.username,
    role: newAdmin.role,
    createdAt: newAdmin.createdAt
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete(context) {
  const { admin, error } = await requireSuperAdmin(context);
  if (error) return error;
  
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (id === admin.id) {
    return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const admins = await getAdmins(context.env);
  const target = admins.find(a => a.id === id);
  
  if (!target) {
    return new Response(JSON.stringify({ error: 'Admin not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const filtered = admins.filter(a => a.id !== id);
  await context.env.DATA.put('auth:admins', JSON.stringify(filtered));
  
  await logActivity(context.env, 'DELETE_ADMIN', `admin:${id}`, admin.id, admin.username, { targetUsername: target.username });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
