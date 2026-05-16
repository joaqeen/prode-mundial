<template>
  <div>
    <h1>Ranking</h1>

    <p v-if="cargando">Cargando ranking...</p>
    <p v-if="error">{{ error }}</p>

    <table v-if="!cargando && ranking.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>Jugador</th>
          <th>Puntos</th>
          <th>Exactos</th>
          <th>Ganadores</th>
          <th>Pronosticados</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(jugador, index) in ranking"
          :key="jugador.id"
          :class="{ destacado: jugador.nombre === jugadorStore.jugador?.nombre }"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ jugador.nombre }}</td>
          <td>{{ jugador.puntos_totales }}</td>
          <td>{{ jugador.exactos }}</td>
          <td>{{ jugador.ganadores }}</td>
          <td>{{ jugador.partidos_pronosticados }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="!cargando && ranking.length === 0">
      Todavía no hay pronósticos cargados.
    </p>

    <router-link to="/pronosticos">Volver a pronósticos</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useJugadorStore } from '../stores/jugador'
import { useRouter } from 'vue-router'

const jugadorStore = useJugadorStore()
const router       = useRouter()
const ranking      = ref([])
const cargando     = ref(false)
const error        = ref('')

if (!jugadorStore.jugador) {
  router.push('/')
}

onMounted(async () => {
  cargando.value = true

  const { data, error: err } = await supabase
    .from('ranking')
    .select('*')

  if (err) {
    error.value = 'Error cargando ranking'
    cargando.value = false
    return
  }

  ranking.value = data
  cargando.value = false
})
</script>

<style scoped>
.destacado {
  font-weight: bold;
  background-color: #f0f9ff;
}
</style>