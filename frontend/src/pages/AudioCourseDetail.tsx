import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Button,
  List,
  Tag,
  Avatar,
  Descriptions,
  message,
  Spin,
} from 'antd'
import { PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { audioApi } from '../api/audio'
import type { AudioCourse, AudioEpisode } from '../types'

const { Title, Text, Paragraph } = Typography

function AudioCourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<AudioCourse | null>(null)
  const [episodes, setEpisodes] = useState<AudioEpisode[]>([])
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (id) {
      loadCourseDetail()
    }
  }, [id])

  const loadCourseDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await audioApi.getById(id)
      const data = res.data?.data || res.data
      setCourse(data)
      setEpisodes(data?.episodes || [])
    } catch (error) {
      console.error('Failed to load course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!id) return
    setPurchasing(true)
    try {
      await audioApi.purchase(id)
      message.success('购买成功')
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setPurchasing(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading || !course) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 240,
              height: 240,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 96,
              flexShrink: 0,
            }}
          >
            🎧
          </div>
          <div style={{ flex: 1 }}>
            <Title level={2}>{course.title}</Title>
            <div style={{ marginBottom: 16 }}>
              <Avatar icon={<span>👤</span>} src={course.creator?.avatar} />
              <Text style={{ marginLeft: 8 }}>{course.creator?.username}</Text>
              {course.isSeries && (
                <Tag color="purple" style={{ marginLeft: 8 }}>
                  系列课
                </Tag>
              )}
            </div>
            <Paragraph type="secondary">{course.description}</Paragraph>
            <Descriptions column={3} style={{ marginTop: 16 }}>
              <Descriptions.Item label="集数">{course.episodeCount}</Descriptions.Item>
              <Descriptions.Item label="总时长">
                {formatDuration(course.totalDuration)}
              </Descriptions.Item>
              <Descriptions.Item label="价格" className="price-text">
                ¥{course.price}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" size="large" onClick={handlePurchase} loading={purchasing}>
                立即购买
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="课程目录" style={{ marginTop: 24 }}>
        <List
          dataSource={episodes}
          renderItem={(episode, index) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  key="play"
                  icon={<PlayCircleOutlined />}
                  onClick={() => navigate(`/audio/play/${course.id}/${episode.id}`)}
                >
                  播放
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Text type="secondary" style={{ marginRight: 12 }}>
                      #{index + 1}
                    </Text>
                    {episode.title}
                  </span>
                }
                description={
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {formatDuration(episode.duration)}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default AudioCourseDetail
