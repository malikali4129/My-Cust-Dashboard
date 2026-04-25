async function getHistory(env, category) {
  return (await env.DATA.get(`history:${category}`, { type: 'json' })) || [];
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const category = params.category;
  try {
    const items = await getHistory(env, category);
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

