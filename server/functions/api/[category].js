// ============================
// KV Helpers
// ============================
async function getItems(env, category) {
  return (await env.DATA.get(`data:${category}`, { type: 'json' })) || [];
}

async function putItems(env, category, items) {
  await env.DATA.put(`data:${category}`, JSON.stringify(items));
}

async function getHistory(env, category) {
  return (await env.DATA.get(`history:${category}`, { type: 'json' })) || [];
}

async function putHistory(env, category, items) {
  await env.DATA.put(`history:${category}`, JSON.stringify(items));
}

function generateId() {
  return crypto.randomUUID();
}

// ============================
// Validation & Sanitization
// ============================
function sanitizeTags(input) {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === 'string') return input.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

function validateItem(body) {
  return {
    title: String(body.title || ''),
    content: String(body.content || ''),
    status: String(body.status || 'active'),
    priority: String(body.priority || 'medium'),
    date: String(body.date || new Date().toISOString()),
    deadline: body.deadline ? String(body.deadline) : null,
    notes: String(body.notes || ''),
    materialUrl: String(body.materialUrl || ''),
    externalLink: String(body.externalLink || ''),
    subjectId: String(body.subjectId || ''),
    tags: sanitizeTags(body.tags)
  };
}

function isPastDeadline(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

// ============================
// Auto-Archive Logic
// ============================
async function autoArchiveIfNeeded(env, category, items) {
  if (category !== 'assignments') return items;

  const historyItems = await getHistory(env, category);
  const historyIds = new Set(historyItems.map(i => i.id));
  const activeItems = [];
  let modified = false;

  for (const item of items) {
    if (item.status !== 'archived' && isPastDeadline(item.deadline)) {
      item.status = 'archived';
      if (!historyIds.has(item.id)) {
        historyItems.unshift({ ...item, archivedAt: new Date().toISOString() });
        modified = true;
      }
    }
    activeItems.push(item);
  }

  if (modified) {
    await putHistory(env, category, historyItems);
    await putItems(env, category, activeItems);
  }

  return activeItems;
}

// ============================
// Route Handlers
// ============================
export async function onRequestGet(context) {
  const { env, params } = context;
  const category = params.category;
  try {
    let items = await getItems(env, category);
    items = await autoArchiveIfNeeded(env, category, items);
    return new Response(JSON.stringify(items), {
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
    const items = await getItems(env, category);

    const newItem = {
      id: generateId(),
      ...validateItem(body)
    };

    items.push(newItem);
    await putItems(env, category, items);

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
    const items = await getItems(env, category);
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedItem = {
      ...items[index],
      ...validateItem(body),
      id: items[index].id
    };

    items[index] = updatedItem;
    await putItems(env, category, items);

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
    const items = await getItems(env, category);
    const filtered = items.filter(i => i.id !== id);

    if (filtered.length === items.length) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await putItems(env, category, filtered);

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

