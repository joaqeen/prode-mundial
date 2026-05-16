<template>
  <div>
    <h1>Prode Mundial 2026</h1>

    <input
      v-model="nombre"
      placeholder="Ingresá tu nombre"
      @keyup.enter="ingresar"
    />

    <button @click="ingresar" :disabled="cargando">
      {{ cargando ? 'Ingresando...' : 'Ingresar' }}
    </button>

    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useJugadorStore } from '../stores/jugador'

const nombre   = ref('')
const error    = ref('')
const cargando = ref(false)

const router       = useRouter()
const jugadorStore = useJugadorStore()

async function ingresar() {
  if (!nombre.value.trim()) {
    error.value = 'Ingresá un nombre'
    return
  }

  cargando.value = true
  error.value    = ''

  const { data: existente } = await supabase
    .from('jugadores')
    .select('id, nombre')
    .eq('nombre', nombre.value.trim())
    .single()

  if (existente) {
    jugadorStore.setJugador(existente)
    router.push('/pronosticos')
  } else {
    const { data: nuevo, error: err } = await supabase
      .from('jugadores')
      .insert({ nombre: nombre.value.trim() })
      .select()
      .single()

    if (err) {
      error.value = 'Ocurrió un error, intentá de nuevo'
    } else {
      jugadorStore.setJugador(nuevo)
      router.push('/pronosticos')
    }
  }

  cargando.value = false
}
</script>