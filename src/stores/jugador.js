import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useJugadorStore = defineStore('jugador', () => {
  const jugador = ref(null)

  function setJugador(data) {
    jugador.value = data
  }

  function limpiar() {
    jugador.value = null
  }

  return { jugador, setJugador, limpiar }
})