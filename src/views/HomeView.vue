<template>
  <div>
    <h1>Prode Mundial 2026</h1>

    <input
      v-model="nombre"
      placeholder="Ingresá tu nombre"
      @keyup.enter="ingresar"
    />

    <input
      v-model="pin"
      placeholder="PIN de 4 dígitos"
      type="password"
      maxlength="4"
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
const pin      = ref('')
const error    = ref('')
const cargando = ref(false)

const router       = useRouter()
const jugadorStore = useJugadorStore()

async function ingresar() {
  if (!nombre.value.trim()) {
    error.value = 'Ingresá un nombre'
    return
  }

  if (pin.value.length !== 4 || isNaN(pin.value)) {
    error.value = 'El PIN debe ser de 4 dígitos'
    return
  }

  cargando.value = true
  error.value    = ''

  // Buscar si el nombre ya existe
  const { data: existente } = await supabase
    .from('jugadores')
    .select('id, nombre, pin')
    .eq('nombre', nombre.value.trim())
    .single()

  if (existente) {
    // El nombre existe → verificar PIN
    if (existente.pin !== pin.value) {
      error.value = 'PIN incorrecto'
      cargando.value = false
      return
    }
    jugadorStore.setJugador(existente)
    router.push('/pronosticos')
  } else {
    // Nombre nuevo → crear con PIN
    const { data: nuevo, error: err } = await supabase
      .from('jugadores')
      .insert({ nombre: nombre.value.trim(), pin: pin.value })
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