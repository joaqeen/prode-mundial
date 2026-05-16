import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const API_KEY = Deno.env.get('FOOTBALL_DATA_KEY')!

Deno.serve(async () => {
  const response = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches',
    {
      headers: {
        'X-Auth-Token': API_KEY
      }
    }
  )

  const data = await response.json()
  const matches = data.matches

  if (!matches || matches.length === 0) {
    return new Response(JSON.stringify({ error: 'No se encontraron partidos' }), {
      status: 404
    })
  }

  const partidos = matches
    .filter((m: any) => m.homeTeam.name && m.awayTeam.name)  // ← solo partidos con equipos definidos
    .map((m: any) => ({
      api_fixture_id:   m.id,
      equipo_local:     m.homeTeam.name,
      equipo_visitante: m.awayTeam.name,
      fecha:            m.utcDate,
      fase:             m.stage,
      goles_local:      m.score.fullTime.home,
      goles_visitante:  m.score.fullTime.away,
      finalizado:       m.status === 'FINISHED'
    }))

  const { error } = await supabase
    .from('partidos')
    .upsert(partidos, { onConflict: 'api_fixture_id' })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ ok: true, sincronizados: partidos.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})