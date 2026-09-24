import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Tag, Avatar, Statistic, Row, Col, Spin, Button, List } from 'antd'
import { BookOutlined, SoundOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons'
import { creatorApi } from '../api/creator'
import { columnApi } from '../api/column'
import { audioApi } from '../api/audio'
import { ebookApi } from '../api/ebook'
import type { Creator, Column, AudioCourse, Ebook } from '../types'

const { Title, Paragraph } = Typography

function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [audio, setAudio] = useState<AudioCourse[]>([])
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const creatorRes = await creatorApi.getProfile(id)
      setCreator(creatorRes.data?.data || creatorRes.data)

      const [columnsRes, audioRes, ebooksRes] = await Promise.all([
        columnApi.list({ size: 5 }),
        audioApi.list({ size: 5 }),
        ebookApi.list({ size: 5 }),
      ])
      setColumns(columnsRes.data?.data?.content || columnsRes.data || [])
      setAudio(audioRes.data?.data?.content || audioRes.data || [])
      setEbooks(ebooksRes.data?.data?.content || ebooksRes.data || [])
    } catch (error) {
      console.error('Failed to load creator data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !creator) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <Avatar size={120} icon={<UserOutlined />} src={creator.avatar} />
          <div style={{ flex: 1 }}>
            <Title level={2}>{creator.username}</Title>
            <div style={{ marginBottom: 16 }}>
              {creator.expertise?.map((tag) => (
                <Tag key={tag} color="purple" style={{ marginRight: 8 }}>
                  {tag}
                </Tag>
              ))}
            </div>
            <Paragraph type="secondary">{creator.bio}</Paragraph>
          </div>
        </div>
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="专栏数量" value={columns.length} prefix={<BookOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="音频课程" value={audio.length} prefix={<SoundOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="电子书" value={ebooks.length} prefix={<ReadOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="专栏作品" style={{ marginTop: 24 }}>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={columns}
          renderItem={(column) => (
            <List.Item>
              <Card
                hoverable
                size="small"
                cover={
                  <div
                    style={{
                      height: 120,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 32,
                    }}
                  >
                    📚
                  </div>
                }
                onClick={() => navigate(`/columns/${column.id}`)}
              >
                <Card.Meta title={column.title} description={`¥${column.monthlyPrice}/月`} />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="音频课程" style={{ marginTop: 24 }}>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={audio}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                size="small"
                cover={
                  <div
                    style={{
                      height: 120,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 32,
                    }}
                  >
                    🎧
                  </div>
                }
                onClick={() => navigate(`/audio/${item.id}`)}
              >
                <Card.Meta title={item.title} description={`¥${item.price}`} />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="电子书" style={{ marginTop: 24 }}>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={ebooks}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                size="small"
                cover={
                  <div
                    style={{
                      height: 120,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 32,
                    }}
                  >
                    📖
                  </div>
                }
                onClick={() => navigate(`/ebooks/${item.id}`)}
              >
                <Card.Meta title={item.title} description={`¥${item.price}`} />
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default CreatorProfile
