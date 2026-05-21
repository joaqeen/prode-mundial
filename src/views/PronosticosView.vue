<template>
  <div class="page">

    <header class="topbar">
      <div class="topbar-inner">
        <div class="topbar-user">
          <span class="avatar">{{ iniciales }}</span>
          <span class="username">{{ jugadorStore.jugador?.nombre }}</span>
        </div>
        <router-link to="/ranking" class="btn-ranking">🏆 Ranking</router-link>
      </div>
    </header>

    <div class="hero-strip">
      <span class="hero-text">⚽ Pronósticos · Mundial 2026</span>
    </div>

    <div class="container">
      <p v-if="cargando" class="loading">Cargando partidos...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <div v-for="(partidosGrupo, grupo) in partidosPorGrupo" :key="grupo" class="grupo-section">
        <div class="grupo-header">
          <span class="grupo-label">{{ grupo }}</span>
        </div>

        <div class="partidos-list">
          <div
            v-for="partido in partidosGrupo"
            :key="partido.id"
            class="partido-card"
            :class="{ finalizado: partido.finalizado }"
          >
            <div class="partido-fecha">{{ formatFecha(partido.fecha) }}</div>

            <div class="partido-row">
              <span class="equipo equipo-local">{{ partido.equipo_local }}</span>

              <div class="score-block">
                <div class="score-input-group">
                  <button
                    class="score-btn"
                    @click="cambiarGol(partido.id, 'goles_local', -1)"
                    :disabled="partido.finalizado || pronosticos[partido.id]?.goles_local <= 0"
                  >−</button>
                  <span class="score-num">{{ pronosticos[partido.id]?.goles_local ?? 0 }}</span>
                  <button
                    class="score-btn"
                    @click="cambiarGol(partido.id, 'goles_local', 1)"
                    :disabled="partido.finalizado"
                  >+</button>
                </div>

                <span class="vs-sep">:</span>

                <div class="score-input-group">
                  <button
                    class="score-btn"
                    @click="cambiarGol(partido.id, 'goles_visitante', -1)"
                    :disabled="partido.finalizado || pronosticos[partido.id]?.goles_visitante <= 0"
                  >−</button>
                  <span class="score-num">{{ pronosticos[partido.id]?.goles_visitante ?? 0 }}</span>
                  <button
                    class="score-btn"
                    @click="cambiarGol(partido.id, 'goles_visitante', 1)"
                    :disabled="partido.finalizado"
                  >+</button>
                </div>
              </div>

              <span class="equipo equipo-visitante">{{ partido.equipo_visitante }}</span>
            </div>

            <div class="partido-footer">
              <span v-if="partido.finalizado" class="badge-finalizado">Finalizado</span>
              <button
                v-else
                class="btn-guardar"
                @click="guardar(partido.id)"
              >Guardar</button>
              <span v-if="guardado[partido.id]" class="guardado-ok">✓ Guardado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useJugadorStore } from '../stores/jugador'
import { useRouter } from 'vue-router'

const jugadorStore = useJugadorStore()
const router       = useRouter()
const partidos     = ref([])
const pronosticos  = ref({})
const guardado     = ref({})
const cargando     = ref(false)
const error        = ref('')

if (!jugadorStore.jugador) router.push('/')

const iniciales = computed(() => {
  const n = jugadorStore.jugador?.nombre ?? ''
  return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const ORDEN_GRUPOS = ['Grupo A','Grupo B','Grupo C','Grupo D','Grupo E','Grupo F','Grupo G','Grupo H','Grupo I','Grupo J','Grupo K','Grupo L']

const partidosPorGrupo = computed(() => {
  const grupos = {}
  partidos.value.forEach(p => {
    const clave = p.grupo ? p.grupo.replace('GROUP_', 'Grupo ') : p.fase
    if (!grupos[clave]) grupos[clave] = []
    grupos[clave].push(p)
  })
  const ordenado = {}
  ORDEN_GRUPOS.forEach(g => { if (grupos[g]) ordenado[g] = grupos[g] })
  Object.keys(grupos).forEach(g => { if (!ordenado[g]) ordenado[g] = grupos[g] })
  return ordenado
})

onMounted(async () => {
  cargando.value = true

  const { data, error: err } = await supabase
    .from('partidos')
    .select('*')
    .order('fecha', { ascending: true })

  if (err) { error.value = 'Error cargando partidos'; cargando.value = false; return }

  partidos.value = data
  data.forEach(p => {
    pronosticos.value[p.id] = { goles_local: 0, goles_visitante: 0 }
  })

  const { data: existentes } = await supabase
    .from('pronosticos')
    .select('*')
    .eq('jugador_id', jugadorStore.jugador.id)

  existentes?.forEach(p => {
    pronosticos.value[p.partido_id] = {
      goles_local:     p.goles_local,
      goles_visitante: p.goles_visitante
    }
  })

  cargando.value = false
})

function cambiarGol(partidoId, campo, delta) {
  const actual = pronosticos.value[partidoId][campo]
  const nuevo  = Math.max(0, actual + delta)
  pronosticos.value[partidoId][campo] = nuevo
}

async function guardar(partidoId) {
  const { goles_local, goles_visitante } = pronosticos.value[partidoId]

  const { error: err } = await supabase
    .from('pronosticos')
    .upsert({
      jugador_id: jugadorStore.jugador.id,
      partido_id: partidoId,
      goles_local,
      goles_visitante
    }, { onConflict: 'jugador_id,partido_id' })

  if (err) { error.value = 'Error guardando pronóstico'; return }

  guardado.value[partidoId] = true
  setTimeout(() => { guardado.value[partidoId] = false }, 2000)
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: #e8f4fd;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.topbar {
  background: linear-gradient(135deg, #0d4a8a, #1a6db5);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.topbar-inner {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-user { display: flex; align-items: center; gap: 0.6rem; }

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(255,255,255,0.4);
}

.username { color: #fff; font-weight: 600; font-size: 0.95rem; }

.btn-ranking {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-ranking:hover { background: rgba(255,255,255,0.25); }

.hero-strip {
  background: linear-gradient(135deg, #1a6db5, #2a9fd6);
  text-align: center;
  padding: 0.6rem;
}
.hero-text { color: rgba(255,255,255,0.9); font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; }

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

.loading { text-align: center; color: #7aaecc; padding: 2rem; }
.error { color: #c0392b; background: #fdf0ee; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 3px solid #c0392b; }

.grupo-section { margin-bottom: 1.5rem; }

.grupo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.grupo-label {
  background: linear-gradient(135deg, #0d4a8a, #1a6db5);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.partidos-list { display: flex; flex-direction: column; gap: 0.6rem; }

.partido-card {
  background: #fff;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(26, 109, 181, 0.08);
  border: 1px solid rgba(26, 109, 181, 0.1);
}
.partido-card.finalizado { opacity: 0.65; }

.partido-fecha {
  font-size: 0.7rem;
  color: #7aaecc;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.6rem;
}

.partido-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.equipo {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a3a5c;
  line-height: 1.2;
}
.equipo-local { text-align: right; }
.equipo-visitante { text-align: left; }

.score-block {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f0f8ff;
  border-radius: 8px;
  padding: 0.2rem;
  border: 1px solid #b8d9f0;
}

.score-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #1a6db5, #2a9fd6);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, transform 0.1s;
  line-height: 1;
}
.score-btn:hover { opacity: 0.85; }
.score-btn:active { transform: scale(0.93); }
.score-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

.score-num {
  width: 24px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a3a5c;
}

.vs-sep {
  font-size: 1rem;
  font-weight: 700;
  color: #7aaecc;
  padding: 0 0.1rem;
}

.partido-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.btn-guardar {
  background: linear-gradient(135deg, #1a6db5, #2a9fd6);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.3rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-guardar:hover { opacity: 0.85; }

.badge-finalizado {
  font-size: 0.75rem;
  color: #7aaecc;
  background: #f0f8ff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #b8d9f0;
}

.guardado-ok {
  font-size: 0.8rem;
  color: #27ae60;
  font-weight: 600;
}
</style>
