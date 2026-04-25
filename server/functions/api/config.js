const DEFAULT_CONFIG = {
  semester: {
    program: 'BBA',
    semester: 1,
    label: 'BBA - Semester 1'
  },
  subjects: [
    { id: 'sub_001', name: 'Introduction to Business', code: 'BUS101' },
    { id: 'sub_002', name: 'Principles of Marketing', code: 'MKT101' },
    { id: 'sub_003', name: 'Financial Accounting', code: 'ACC101' }
  ],
  categories: [
    { id: 'notices', label: 'Notices', icon: 'megaphone', color: 'indigo' },
    { id: 'assignments', label: 'Assignments', icon: 'clipboard-list', color: 'amber' },
    { id: 'quizzes', label: 'Quizzes', icon: 'check-circle', color: 'emerald' },
    { id: 'exams', label: 'Exam Timetable', icon: 'calendar', color: 'rose' }
  ]
};

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

