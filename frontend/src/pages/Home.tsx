import { useEffect, useState } from 'react'
import { Row, Col, Card, Tag, Button, Statistic, List, Avatar } from 'antd'
import {
  FireOutlined,
  StarOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { columnApi } from '../api/column'
import { audioApi } from '../api/audio'
import { ebookApi } from '../api/ebook'
import type { Column, AudioCourse, Ebook } from '../types'

function Home() {
  const navigate = useNavigate()
  const [hotColumns, setHotColumns] = useState<Column[]>([])
  const [newAudio, setNewAudio] = useState<AudioCourse[]>([])
  const [newEbooks, setNewEbooks] = useState<Ebook[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [columnsRes, audioRes, ebooksRes] = await Promise.all([
        columnApi.list({ size: 4 }),
        audioApi.list({ size: 4 }),
        ebookApi.list({ size: 4 }),
      ])
      setHotColumns(columnsRes.data?.data?.content || columnsRes.data || [])
      setNewAudio(audioRes.data?.data?.content || audioRes.data || [])
      setNewEbooks(ebooksRes.data?.data?.content || ebooksRes.data || [])
    } catch (error) {
      console.error('Failed to load home data:', error)
    }
  }

  return (
    <div>
      <div className="section-title">
        <FireOutlined style={{ color: '#f5222d', marginRight: '8px' }} />
        热门专栏
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {hotColumns.map((column) => (
          <Col span={6} key={column.id}>
            <Card
              hoverable
              className="card-hover"
              cover={
                <div
                  style={{
                    height: 160,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 48,
                  }}
                >
                  📚
                </div>
              }
              onClick={() => navigate(`/columns/${column.id}`)}
            >
              <Card.Meta
                title={column.title}
                description={
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      {column.creator?.username && (
                        <Tag color="blue">{column.creator.username}</Tag>
                      )}
                    </div>
                    <div className="price-text">¥{column.monthlyPrice}/月</div>
                    <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                      {column.articleCount}篇文章 · {column.subscriberCount}订阅
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <div className="section-title">
            <StarOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            新品音频课
          </div>
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={newAudio}
            renderItem={(audio) => (
              <List.Item>
                <Card
                  hoverable
                  className="card-hover"
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
                  onClick={() => navigate(`/audio/${audio.id}`)}
                >
                  <div style={{ fontWeight: 500 }}>{audio.title}</div>
                  <div style={{ color: '#f5222d', marginTop: '8px' }}>
                    ¥{audio.price}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Col>

        <Col span={12}>
          <div className="section-title">
            <RiseOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
            编辑精选电子书
          </div>
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={newEbooks}
            renderItem={(ebook) => (
              <List.Item>
                <Card
                  hoverable
                  className="card-hover"
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
                  onClick={() => navigate(`/ebooks/${ebook.id}`)}
                >
                  <div style={{ fontWeight: 500 }}>{ebook.title}</div>
                  <div style={{ color: '#f5222d', marginTop: '8px' }}>
                    ¥{ebook.price}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Home
