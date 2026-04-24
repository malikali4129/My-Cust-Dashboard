// Auth utilities for Cloudflare Pages Functions
// Uses Web Crypto API (HMAC-SHA256 JWT + SHA-256 password hashing)

const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getSecret(env) {
  let secret = await env.DATA.get('auth:secret');
  if (!secret) {
    secret = generateSecret();
    await env.DATA.put('auth:secret', secret);
  }
  return secret;
}

function generateSecret() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signToken(payload, secret) {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadWithExp = { ...payload, exp: Date.now() + TOKEN_EXPIRY };
  const payloadB64 = btoa(JSON.stringify(payloadWithExp)).replace(/=/g, '');
  const data = `${headerB64}.${payloadB64}`;
  
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), 
    { name: 'HMAC', hash: 'SHA-256' }, 
    false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
  
  return `${data}.${sigB64}`;
}

export async function verifyToken(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const encoder = new TextEncoder();
  
  try {
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), 
      { name: 'HMAC', hash: 'SHA-256' }, 
      false, ['verify']
    );
    const signature = new Uint8Array(atob(sigB64).split('').map(c => c.charCodeAt(0)));
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    if (!valid) return null;
    
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export async function getAdmins(env) {
  const admins = await env.DATA.get('auth:admins', { type: 'json' });
  return admins || [];
}

export async function ensureDefaultAdmin(env) {
  const admins = await getAdmins(env);
  if (admins.length === 0) {
    const salt = generateSalt();
    const passwordHash = await hashPassword('admin123', salt);
    const defaultAdmin = {
      id: crypto.randomUUID(),
      username: 'admin',
      passwordHash,
      salt,
      role: 'superadmin',
      createdAt: new Date().toISOString()
    };
    await env.DATA.put('auth:admins', JSON.stringify([defaultAdmin]));
  }
}

export async function requireAuth(context) {
  const { env, request } = context;
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { 
      admin: null, 
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }) 
    };
  }
  
  const secret = await getSecret(env);
  const payload = await verifyToken(token, secret);
  
  if (!payload) {
    return { 
      admin: null, 
      error: new Response(JSON.stringify({ error: 'Invalid or expired token' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }) 
    };
  }
  
  const admins = await getAdmins(env);
  const admin = admins.find(a => a.id === payload.adminId);
  
  if (!admin) {
    return { 
      admin: null, 
      error: new Response(JSON.stringify({ error: 'Admin not found' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }) 
    };
  }
  
  return { admin: { id: admin.id, username: admin.username, role: admin.role }, error: null };

}

export async function requireSuperAdmin(context) {
  const { admin, error } = await requireAuth(context);
  if (error) return { admin: null, error };
  if (admin.role !== 'superadmin') {
    return { 
      admin: null, 
      error: new Response(JSON.stringify({ error: 'Superadmin required' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }) 
    };
  }
  return { admin, error: null };
}

export async function logActivity(env, action, target, adminId, adminName, details = {}) {
  try {
    const logs = await env.DATA.get('logs:activity', { type: 'json' }) || [];
    logs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      target,
      adminId,
      adminName,
      details
    });
    // Keep last 500 logs
    if (logs.length > 500) logs.length = 500;
    await env.DATA.put('logs:activity', JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}
