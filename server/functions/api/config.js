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

function migrateConfig(config) {
  let changed = false;
  if (!config.semester) {
    config.semester = { ...DEFAULT_CONFIG.semester };
    changed = true;
  }
  if (!config.subjects || !Array.isArray(config.subjects)) {
    config.subjects = [...DEFAULT_CONFIG.subjects];
    changed = true;
  }
  if (!config.categories || !Array.isArray(config.categories)) {
    config.categories = [...DEFAULT_CONFIG.categories];
    changed = true;
  }
  return { config, changed };
}

export async function onRequestGet(context) {
  const { env } = context;
  try {
    let config = await env.DATA.get('config', { type: 'json' });
    if (!config) {
      await env.DATA.put('config', JSON.stringify(DEFAULT_CONFIG));
      return new Response(JSON.stringify(DEFAULT_CONFIG), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const migrated = migrateConfig(config);
    if (migrated.changed) {
      await env.DATA.put('config', JSON.stringify(migrated.config));
    }
    return new Response(JSON.stringify(migrated.config), {
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
    // Ensure new fields are always present
    const payload = {
      categories: body.categories,
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
      semester: body.semester || DEFAULT_CONFIG.semester
    };
    await env.DATA.put('config', JSON.stringify(payload));
    return new Response(JSON.stringify({ success: true, config: payload }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

