import { createSlice } from '@reduxjs/toolkit'
import type { AudioEpisode, AudioCourse } from '../../types'

interface PlayerState {
  currentEpisode: AudioEpisode | null
  currentCourse: AudioCourse | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playSpeed: number
  autoStopMinutes: number | null
}

const initialState: PlayerState = {
  currentEpisode: null,
  currentCourse: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playSpeed: 1.0,
  autoStopMinutes: null,
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setEpisode: (state, action) => {
      state.currentEpisode = action.payload.episode
      state.currentCourse = action.payload.course
      state.currentTime = 0
    },
    play: (state) => {
      state.isPlaying = true
    },
    pause: (state) => {
      state.isPlaying = false
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload
    },
    setDuration: (state, action) => {
      state.duration = action.payload
    },
    setPlaySpeed: (state, action) => {
      state.playSpeed = action.payload
    },
    setAutoStop: (state, action) => {
      state.autoStopMinutes = action.payload
    },
  },
})

export const {
  setEpisode,
  play,
  pause,
  setCurrentTime,
  setDuration,
  setPlaySpeed,
  setAutoStop,
} = playerSlice.actions

export default playerSlice.reducer
