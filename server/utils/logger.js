import supabase from '../db/supabase.js'

export async function logActivity({ userId, action, entityType, entityTitle, meta = {}, urgency = 'low' }) {
  const { error } = await supabase.from('activity_logs').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_title: entityTitle ?? null,
    meta,
    urgency,
  })
  if (error) console.error('[logger]', error.message)
}

export function taskUrgency(priority) {
  if (priority === 'high') return 'high'
  if (priority === 'medium') return 'medium'
  return 'low'
}
