<template>
  <div class="page">

    <header class="hero">
      <div class="hero-rays"></div>
      <div class="hero-content">
        <h1 class="hero-title">PRODE</h1>
        <p class="hero-sub">MUNDIAL 2026</p>
      </div>
    </header>

    <div class="container">

      <div class="card form-card">
        <h2 class="card-title">Ingresá al prode</h2>

        <div class="field">
          <label class="label">Tu nombre</label>
          <input
            v-model="nombre"
            class="input"
            placeholder="Ej: Juan Pérez"
            @keyup.enter="ingresar"
          />
        </div>

        <div class="field">
          <label class="label">PIN de 4 dígitos</label>
          <input
            v-model="pin"
            class="input"
            type="password"
            maxlength="4"
            placeholder="••••"
            @keyup.enter="ingresar"
          />
          <span class="hint">Primera vez: elegí tu PIN. Próximas veces: usá el mismo.</span>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn" @click="ingresar" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Entrar al prode →' }}
        </button>
      </div>

      <div class="card ranking-card" v-if="topRanking.length > 0">
        <h2 class="card-title">🏆 Top 10</h2>
        <div class="ranking-list">
          <div
            v-for="(jugador, index) in topRanking"
            :key="jugador.id"
            class="ranking-row"
          >
            <span class="pos" :class="'pos-' + (index + 1)">{{ index + 1 }}</span>
            <span class="nombre">{{ jugador.nombre }}</span>
            <span class="puntos">{{ jugador.puntos_totales }} pts</span>
          </div>
        </div>
      </div>

      <p v-if="cargandoRanking" class="loading">Cargando ranking...</p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useJugadorStore } from '../stores/jugador'

const nombre        = ref('')
const pin           = ref('')
const error         = ref('')
const cargando      = ref(false)
const cargandoRanking = ref(false)
const topRanking    = ref([])

const router       = useRouter()
const jugadorStore = useJugadorStore()

onMounted(async () => {
  cargandoRanking.value = true
  const { data } = await supabase
    .from('ranking')
    .select('*')
    .limit(10)
  topRanking.value = data ?? []
  cargandoRanking.value = false
})

async function ingresar() {
  if (!nombre.value.trim()) { error.value = 'Ingresá un nombre'; return }
  if (pin.value.length !== 4 || isNaN(pin.value)) { error.value = 'El PIN debe ser de 4 dígitos'; return }

  cargando.value = true
  error.value    = ''

  const { data: existente } = await supabase
    .from('jugadores')
    .select('id, nombre, pin')
    .eq('nombre', nombre.value.trim())
    .single()

  if (existente) {
    if (existente.pin !== pin.value) {
      error.value = 'PIN incorrecto'
      cargando.value = false
      return
    }
    jugadorStore.setJugador(existente)
    router.push('/pronosticos')
  } else {
    const { data: nuevo, error: err } = await supabase
      .from('jugadores')
      .insert({ nombre: nombre.value.trim(), pin: pin.value })
      .select()
      .single()

    if (err) { error.value = 'Ocurrió un error, intentá de nuevo' }
    else {
      jugadorStore.setJugador(nuevo)
      router.push('/pronosticos')
    }
  }
  cargando.value = false
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: #e8f4fd;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.hero {
  position: relative;
  background: linear-gradient(160deg, #1a6db5 0%, #2a9fd6 50%, #75cef0 100%);
  padding: 3rem 1rem 2.5rem;
  text-align: center;
  overflow: hidden;
}

.hero-rays {
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(
    from 0deg at 50% 60%,
    rgba(255,255,255,0.08) 0deg,
    transparent 6deg,
    rgba(255,255,255,0.08) 12deg
  );
}

.hero-content { position: relative; z-index: 1; }

.ball { font-size: 3.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 3px 0 #0d4a8a, 0 6px 12px rgba(0,0,0,0.3);
  line-height: 1;
}

.hero-sub {
  font-size: 1rem;
  font-weight: 700;
  color: #d4f0ff;
  letter-spacing: 6px;
  margin-top: 0.25rem;
}

.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 109, 181, 0.12);
  border: 1px solid rgba(26, 109, 181, 0.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a3a5c;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e8f4fd;
}

.field { margin-bottom: 1rem; }

.label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a6db5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.4rem;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #b8d9f0;
  border-radius: 10px;
  font-size: 1rem;
  color: #1a3a5c;
  background: #f5fbff;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus { border-color: #1a6db5; background: #fff; }

.hint {
  display: block;
  font-size: 0.75rem;
  color: #7aaecc;
  margin-top: 0.35rem;
}

.error {
  color: #c0392b;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  background: #fdf0ee;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border-left: 3px solid #c0392b;
}

.btn {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #1a6db5, #2a9fd6);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: opacity 0.2s, transform 0.1s;
  box-shadow: 0 4px 12px rgba(26, 109, 181, 0.4);
}
.btn:hover { opacity: 0.92; }
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ranking-list { display: flex; flex-direction: column; gap: 0.5rem; }

.ranking-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  background: #f5fbff;
}

.pos {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #ddeef9;
  color: #1a6db5;
}
.pos-1 { background: linear-gradient(135deg, #f6d365, #fda085); color: #7a3b00; }
.pos-2 { background: linear-gradient(135deg, #d0d0d0, #a0a0a0); color: #3a3a3a; }
.pos-3 { background: linear-gradient(135deg, #e8a87c, #c07341); color: #5a2800; }

.nombre { flex: 1; font-size: 0.95rem; font-weight: 600; color: #1a3a5c; }
.puntos { font-size: 0.85rem; font-weight: 700; color: #1a6db5; }

.loading { text-align: center; color: #7aaecc; font-size: 0.9rem; }
</style>
