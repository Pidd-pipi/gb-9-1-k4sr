import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../api/auth'
import type { User } from '../../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    return { token, user }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }) => {
    const response = await authApi.register(userData)
    const { token, user } = response.data
    localStorage.setItem('token', token)
    return { token, user }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.loading = false
      })
      .addCase(login.rejected, (state) => {
        state.loading = false
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.user = null
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
