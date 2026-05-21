<template>
  <div>
    <h1>Hola, {{ jugadorStore.jugador?.nombre }}</h1>

    <p v-if="cargando">Cargando partidos...</p>
    <p v-if="error">{{ error }}</p>

    <div v-for="(partidos, grupo) in partidosPorGrupo" :key="grupo">
      <h2>{{ grupo }}</h2>

      <div v-for="partido in partidos" :key="partido.id">
        <span>{{ partido.equipo_local }}</span>

        <input
          type="number"
          min="0"
          v-model.number="pronosticos[partido.id].goles_local"
        />

        <span>vs</span>

        <input
          type="number"
          min="0"
          v-model.number="pronosticos[partido.id].goles_visitante"
        />

        <span>{{ partido.equipo_visitante }}</span>

        <span>{{ formatFecha(partido.fecha) }}</span>

        <button
          @click="guardar(partido.id)"
          :disabled="partido.finalizado"
        >
          {{ partido.finalizado ? 'Finalizado' : 'Guardar' }}
        </button>

        <span v-if="guardado[partido.id]">✓ Guardado</span>
      </div>
    </div>

    <router-link to="/ranking">Ver ranking</router-link>
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

if (!jugadorStore.jugador) {
  router.push('/')
}

// Agrupa los partidos por grupo usando computed
// computed recalcula automáticamente cuando cambia partidos.value
const partidosPorGrupo = computed(() => {
  const grupos = {}

  partidos.value.forEach(p => {
    const clave = p.grupo.replace('GROUP_', 'Grupo ')

    if (!grupos[clave]) {
      grupos[clave] = []
    }
    grupos[clave].push(p)
  })

  return grupos
})

onMounted(async () => {
  cargando.value = true

  const { data, error: err } = await supabase
    .from('partidos')
    .select('*')
    .order('fecha', { ascending: true })

  if (err) {
    error.value = 'Error cargando partidos'
    cargando.value = false
    return
  }

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

async function guardar(partidoId) {
  const { goles_local, goles_visitante } = pronosticos.value[partidoId]

  const { error: err } = await supabase
    .from('pronosticos')
    .upsert({
      jugador_id:      jugadorStore.jugador.id,
      partido_id:      partidoId,
      goles_local,
      goles_visitante
    }, { onConflict: 'jugador_id,partido_id' })

  if (err) {
    error.value = 'Error guardando pronóstico'
    return
  }

  guardado.value[partidoId] = true
  setTimeout(() => { guardado.value[partidoId] = false }, 2000)
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day:     '2-digit',
    month:   '2-digit',
    year:    'numeric',
    hour:    '2-digit',
    minute:  '2-digit'
  })
}
</script>