<template>
  <div class="page">

    <header class="topbar">
      <div class="topbar-inner">
        <router-link to="/pronosticos" class="btn-back">← Volver</router-link>
        <span class="topbar-title">Ranking</span>
        <div style="width:80px"></div>
      </div>
    </header>

    <div class="hero-strip">
      <div class="hero-rays"></div>
      <div class="hero-content">
        <div class="trophy-icon">🏆</div>
        <h1 class="hero-title">TABLA DE POSICIONES</h1>
        <p class="hero-sub">Mundial 2026</p>
      </div>
    </div>

    <div class="container">

      <p v-if="cargando" class="loading">Cargando ranking...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="!cargando && ranking.length >= 3" class="podio">
        <div class="podio-item podio-2">
          <div class="podio-avatar silver">{{ iniciales(ranking[1].nombre) }}</div>
          <div class="podio-name">{{ ranking[1].nombre }}</div>
          <div class="podio-pts">{{ ranking[1].puntos_totales }} pts</div>
          <div class="podio-base silver-base">2</div>
        </div>
        <div class="podio-item podio-1">
          <div class="podio-crown">👑</div>
          <div class="podio-avatar gold">{{ iniciales(ranking[0].nombre) }}</div>
          <div class="podio-name">{{ ranking[0].nombre }}</div>
          <div class="podio-pts">{{ ranking[0].puntos_totales }} pts</div>
          <div class="podio-base gold-base">1</div>
        </div>
        <div class="podio-item podio-3">
          <div class="podio-avatar bronze">{{ iniciales(ranking[2].nombre) }}</div>
          <div class="podio-name">{{ ranking[2].nombre }}</div>
          <div class="podio-pts">{{ ranking[2].puntos_totales }} pts</div>
          <div class="podio-base bronze-base">3</div>
        </div>
      </div>

      <div v-if="!cargando && ranking.length > 0" class="tabla-card">
        <div class="tabla-header">
          <span class="col-pos">#</span>
          <span class="col-nombre">Jugador</span>
          <span class="col-pts">Pts</span>
          <span class="col-stat">Exactos</span>
          <span class="col-stat">Ganadores</span>
        </div>

        <div
          v-for="(jugador, index) in ranking"
          :key="jugador.id"
          class="tabla-row"
          :class="{
            'row-me': jugador.nombre === jugadorStore.jugador?.nombre,
            'row-top1': index === 0,
            'row-top3': index > 0 && index < 3
          }"
        >
          <span class="col-pos">
            <span class="pos-badge" :class="'pos-' + (index + 1)">{{ index + 1 }}</span>
          </span>
          <span class="col-nombre">
            <span class="jugador-iniciales">{{ iniciales(jugador.nombre) }}</span>
            {{ jugador.nombre }}
            <span v-if="jugador.nombre === jugadorStore.jugador?.nombre" class="you-badge">Vos</span>
          </span>
          <span class="col-pts pts-value">{{ jugador.puntos_totales }}</span>
          <span class="col-stat">⭐ {{ jugador.exactos }}</span>
          <span class="col-stat">✓ {{ jugador.ganadores }}</span>
        </div>

        <div v-if="ranking.length === 0 && !cargando" class="empty">
          Todavía no hay pronósticos cargados.
        </div>
      </div>

      <div class="leyenda">
        <div class="leyenda-item"><span class="dot gold-dot"></span> 3 pts — Resultado exacto</div>
        <div class="leyenda-item"><span class="dot blue-dot"></span> 1 pt — Ganador correcto</div>
        <div class="leyenda-item"><span class="dot gray-dot"></span> 0 pts — Sin acierto</div>
      </div>

    </div>
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

if (!jugadorStore.jugador) router.push('/')

onMounted(async () => {
  cargando.value = true
  const { data, error: err } = await supabase.from('ranking').select('*')
  if (err) { error.value = 'Error cargando ranking' }
  else { ranking.value = data }
  cargando.value = false
})

function iniciales(nombre) {
  return (nombre ?? '').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
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

.btn-back {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  background: rgba(255,255,255,0.12);
  transition: background 0.2s;
  width: 80px;
}
.btn-back:hover { background: rgba(255,255,255,0.22); }

.topbar-title { color: #fff; font-weight: 700; font-size: 1rem; letter-spacing: 1px; }

.hero-strip {
  position: relative;
  background: linear-gradient(160deg, #1a6db5 0%, #2a9fd6 50%, #75cef0 100%);
  padding: 2rem 1rem 1.5rem;
  text-align: center;
  overflow: hidden;
}

.hero-rays {
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(
    from 0deg at 50% 70%,
    rgba(255,255,255,0.07) 0deg,
    transparent 6deg,
    rgba(255,255,255,0.07) 12deg
  );
}

.hero-content { position: relative; z-index: 1; }
.trophy-icon { font-size: 2.5rem; margin-bottom: 0.25rem; }

.hero-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 3px;
  text-shadow: 0 2px 0 #0d4a8a, 0 4px 8px rgba(0,0,0,0.2);
}

.hero-sub {
  font-size: 0.8rem;
  color: #d4f0ff;
  letter-spacing: 4px;
  font-weight: 600;
  margin-top: 0.2rem;
}

.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

.loading { text-align: center; color: #7aaecc; padding: 2rem; }
.error { color: #c0392b; background: #fdf0ee; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 3px solid #c0392b; }

.podio {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0 0;
}

.podio-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 140px;
}

.podio-crown { font-size: 1.25rem; margin-bottom: 0.25rem; }

.podio-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  border: 3px solid rgba(255,255,255,0.6);
}
.gold   { background: linear-gradient(135deg, #f6d365, #fda085); color: #7a3b00; }
.silver { background: linear-gradient(135deg, #d0d0d0, #a0a0a0); color: #3a3a3a; }
.bronze { background: linear-gradient(135deg, #e8a87c, #c07341); color: #5a2800; }

.podio-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a3a5c;
  text-align: center;
  margin-bottom: 0.2rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podio-pts {
  font-size: 0.72rem;
  color: #1a6db5;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.podio-base {
  width: 100%;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: rgba(255,255,255,0.8);
}
.gold-base   { height: 70px; background: linear-gradient(135deg, #f6c200, #e6a800); }
.silver-base { height: 52px; background: linear-gradient(135deg, #bdbdbd, #9e9e9e); }
.bronze-base { height: 40px; background: linear-gradient(135deg, #cd7f32, #b8722a); }

.tabla-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(26, 109, 181, 0.12);
  border: 1px solid rgba(26, 109, 181, 0.1);
  margin-bottom: 1.25rem;
}

.tabla-header {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #0d4a8a, #1a6db5);
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  gap: 0.5rem;
}

.tabla-row {
  display: flex;
  align-items: center;
  padding: 0.65rem 1rem;
  gap: 0.5rem;
  border-bottom: 1px solid #f0f8ff;
  transition: background 0.15s;
}
.tabla-row:last-child { border-bottom: none; }
.tabla-row:hover { background: #f5fbff; }
.row-me { background: #e8f4fd !important; }
.row-top1 { background: #fffbf0; }
.row-top3 { background: #fafafa; }

.col-pos { width: 36px; flex-shrink: 0; display: flex; justify-content: center; }
.col-nombre { flex: 1; font-size: 0.9rem; font-weight: 600; color: #1a3a5c; display: flex; align-items: center; gap: 0.5rem; }
.col-pts { width: 48px; text-align: center; flex-shrink: 0; }
.col-stat { width: 72px; text-align: center; font-size: 0.8rem; color: #5a8aaa; flex-shrink: 0; }

.pos-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  background: #ddeef9;
  color: #1a6db5;
}
.pos-1 { background: linear-gradient(135deg, #f6d365, #fda085); color: #7a3b00; }
.pos-2 { background: linear-gradient(135deg, #d0d0d0, #a0a0a0); color: #3a3a3a; }
.pos-3 { background: linear-gradient(135deg, #e8a87c, #c07341); color: #5a2800; }

.jugador-iniciales {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8f4fd;
  color: #1a6db5;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid #b8d9f0;
}

.you-badge {
  font-size: 0.65rem;
  background: #1a6db5;
  color: #fff;
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
  font-weight: 700;
}

.pts-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1a6db5;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #7aaecc;
  font-size: 0.9rem;
}

.leyenda {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0 0.25rem;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #5a8aaa;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.gold-dot   { background: #f6c200; }
.blue-dot   { background: #1a6db5; }
.gray-dot   { background: #b0c4d4; }
</style>
