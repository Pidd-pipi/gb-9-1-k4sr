import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ColumnList from './pages/ColumnList'
import ColumnDetail from './pages/ColumnDetail'
import AudioCourseList from './pages/AudioCourseList'
import AudioCourseDetail from './pages/AudioCourseDetail'
import EbookList from './pages/EbookList'
import EbookDetail from './pages/EbookDetail'
import EbookReader from './pages/EbookReader'
import AudioPlayer from './pages/AudioPlayer'
import PointsMall from './pages/PointsMall'
import MyOrders from './pages/MyOrders'
import MySubscriptions from './pages/MySubscriptions'
import MyPoints from './pages/MyPoints'
import CreatorProfile from './pages/CreatorProfile'
import CreatorApply from './pages/CreatorApply'
import CreatorDashboard from './pages/CreatorDashboard'
import Search from './pages/Search'
import Checkin from './pages/Checkin'
import { authApi } from './api/auth'

function App() {
  const { user, token } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && !token) {
      authApi.getCurrentUser().catch(() => {
        localStorage.removeItem('token')
      })
    }
    setLoading(false)
  }, [token])

  if (loading) {
    return null
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="columns" element={<ColumnList />} />
        <Route path="columns/:id" element={<ColumnDetail />} />
        <Route path="audio" element={<AudioCourseList />} />
        <Route path="audio/:id" element={<AudioCourseDetail />} />
        <Route path="audio/play/:courseId/:episodeId" element={<AudioPlayer />} />
        <Route path="ebooks" element={<EbookList />} />
        <Route path="ebooks/:id" element={<EbookDetail />} />
        <Route path="ebooks/read/:id" element={<EbookReader />} />
        <Route path="points-mall" element={<PointsMall />} />
        <Route path="search" element={<Search />} />
        <Route path="checkin" element={<Checkin />} />
        <Route path="my/orders" element={<MyOrders />} />
        <Route path="my/subscriptions" element={<MySubscriptions />} />
        <Route path="my/points" element={<MyPoints />} />
        <Route path="creators/:id" element={<CreatorProfile />} />
        <Route path="creator/apply" element={<CreatorApply />} />
        <Route path="creator/dashboard" element={<CreatorDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
