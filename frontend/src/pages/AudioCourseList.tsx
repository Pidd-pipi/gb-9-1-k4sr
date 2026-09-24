import { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Pagination, Spin, Empty, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { audioApi } from '../api/audio'
import type { AudioCourse } from '../types'

const { Title } = Typography

function AudioCourseList() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<AudioCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    loadCourses()
  }, [page, pageSize])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const res = await audioApi.list({ page: page - 1, size: pageSize })
      const data = res.data?.data?.content || res.data || []
      setCourses(data)
      setTotal(res.data?.data?.totalElements || data.length)
    } catch (error) {
      console.error('Failed to load audio courses:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>音频课程</Title>
      <Spin spinning={loading}>
        {courses.length > 0 ? (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {courses.map((course) => (
                <Col span={6} key={course.id}>
                  <Card
                    hoverable
                    className="card-hover"
                    cover={
                      <div
                        style={{
                          height: 180,
                          background:
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 64,
                        }}
                      >
                        🎧
                      </div>
                    }
                    onClick={() => navigate(`/audio/${course.id}`)}
                  >
                    <Card.Meta
                      title={course.title}
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            {course.creator?.username && (
                              <Tag color="blue">{course.creator.username}</Tag>
                            )}
                            {course.isSeries && <Tag>系列课</Tag>}
                          </div>
                          <div className="price-text">¥{course.price}</div>
                          <div
                            style={{
                              color: '#999',
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {course.episodeCount}集
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(p, ps) => {
                  setPage(p)
                  setPageSize(ps)
                }}
              />
            </div>
          </>
        ) : (
          <Empty description="暂无音频课程" style={{ marginTop: 100 }} />
        )}
      </Spin>
    </div>
  )
}

export default AudioCourseList
