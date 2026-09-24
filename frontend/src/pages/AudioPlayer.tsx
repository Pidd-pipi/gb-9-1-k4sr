import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Slider,
  Button,
  Select,
  message,
  Spin,
  Space,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ForwardOutlined,
  BackwardOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  play,
  pause,
  setCurrentTime,
  setDuration,
  setPlaySpeed,
  setAutoStop,
} from '../store/slices/playerSlice'
import { audioApi } from '../api/audio'
import type { AudioEpisode, AudioCourse } from '../types'

const { Title } = Typography

function AudioPlayer() {
  const { courseId, episodeId } = useParams<{ courseId: string; episodeId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [episode, setEpisode] = useState<AudioEpisode | null>(null)
  const [course, setCourse] = useState<AudioCourse | null>(null)
  const [loading, setLoading] = useState(false)

  const { currentTime, duration, isPlaying, playSpeed, autoStopMinutes } = useSelector(
    (state: RootState) => state.player
  )

  useEffect(() => {
    if (courseId && episodeId) {
      loadEpisode()
    }
  }, [courseId, episodeId])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playSpeed
    }
  }, [playSpeed])

  const loadEpisode = async () => {
    if (!courseId || !episodeId) return
    setLoading(true)
    try {
      const [courseRes, episodeRes] = await Promise.all([
        audioApi.getById(courseId),
        audioApi.getEpisode(courseId, episodeId),
      ])
      setCourse(courseRes.data?.data || courseRes.data)
      setEpisode(episodeRes.data?.data || episodeRes.data)
    } catch (error) {
      console.error('Failed to load episode:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      dispatch(pause())
    } else {
      audioRef.current.play()
      dispatch(play())
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime))
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration))
    }
  }

  const handleSliderChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value
      dispatch(setCurrentTime(value))
    }
  }

  const handleSeek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const speedOptions = [
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1.0x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2.0x' },
  ]

  const autoStopOptions = [
    { value: 0, label: '不停止' },
    { value: 15, label: '15分钟后' },
    { value: 30, label: '30分钟后' },
    { value: 60, label: '60分钟后' },
  ]

  if (loading || !episode) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div
            style={{
              width: 200,
              height: 200,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 80,
              flexShrink: 0,
            }}
          >
            🎧
          </div>
          <div style={{ flex: 1 }}>
            <Title level={3}>{episode.title}</Title>
            <Title level={5} type="secondary">
              {course?.title}
            </Title>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <audio
          ref={audioRef}
          src={`/api/audio/${courseId}/episodes/${episodeId}/stream`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => dispatch(pause())}
          onError={() => message.error('音频加载失败')}
          style={{ display: 'none' }}
        />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space size="middle" align="center">
            <Button
              type="text"
              icon={<BackwardOutlined />}
              onClick={() => handleSeek(-10)}
              size="large"
            >
              后退10秒
            </Button>
            <Button
              type="primary"
              shape="circle"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={handlePlayPause}
              size="large"
              style={{ width: 64, height: 64, fontSize: 32 }}
            />
            <Button
              type="text"
              icon={<ForwardOutlined />}
              onClick={() => handleSeek(10)}
              size="large"
            >
              前进10秒
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Slider
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSliderChange}
            tooltip={{ formatter: formatTime }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Space>
            <span>播放速度：</span>
            <Select
              value={playSpeed}
              onChange={(value) => dispatch(setPlaySpeed(value))}
              style={{ width: 100 }}
              options={speedOptions}
            />
          </Space>
          <Space>
            <span>
              <ClockCircleOutlined /> 定时关闭：
            </span>
            <Select
              value={autoStopMinutes || 0}
              onChange={(value) => dispatch(setAutoStop(value || null))}
              style={{ width: 120 }}
              options={autoStopOptions}
            />
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default AudioPlayer
