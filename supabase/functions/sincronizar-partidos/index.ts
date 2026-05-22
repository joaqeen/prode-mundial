import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const API_KEY = Deno.env.get('FOOTBALL_DATA_KEY')!

Deno.serve(async () => {
  // 1. Traer partidos de football-data.org
  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches',
    {
      headers: { 'X-Auth-Token': API_KEY }
    }
  )

  const data = await response.json()
  const matches = data.matches

  if (!matches || matches.length === 0) {
    return new Response(JSON.stringify({ error: 'No se encontraron partidos' }), {
      status: 404
    })
  }

  // 2. Mapear al formato de la tabla
  const partidos = matches
  .filter((m: any) => m.homeTeam.name && m.awayTeam.name)
  .map((m: any) => ({
    api_fixture_id:   m.id,
    equipo_local:     m.homeTeam.name,
    equipo_visitante: m.awayTeam.name,
    crest_local:      m.homeTeam.crest,      // ← nuevo
    crest_visitante:  m.awayTeam.crest,      // ← nuevo
    fecha:            m.utcDate,
    fase:             m.stage,
    grupo:            m.group,
    goles_local:      m.score.fullTime.home,
    goles_visitante:  m.score.fullTime.away,
    finalizado:       m.status === 'FINISHED'
  }))

  // 3. Upsert en Supabase
  const { error: upsertError } = await supabase
    .from('partidos')
    .upsert(partidos, { onConflict: 'api_fixture_id' })

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 })
  }

  // 4. Traer los partidos finalizados para calcular puntos
  const { data: partidosFinalizados, error: fetchError } = await supabase
    .from('partidos')
    .select('id')
    .eq('finalizado', true)

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  // 5. Llamar a calcular_puntos() para cada partido finalizado
  for (const partido of partidosFinalizados ?? []) {
    await supabase.rpc('calcular_puntos', { p_partido_id: partido.id })
  }

  return new Response(
    JSON.stringify({
      ok: true,
      sincronizados: partidos.length,
      puntos_calculados: partidosFinalizados?.length ?? 0
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})