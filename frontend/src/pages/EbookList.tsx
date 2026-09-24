import { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Pagination, Spin, Empty, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ebookApi } from '../api/ebook'
import type { Ebook } from '../types'

const { Title } = Typography

function EbookList() {
  const navigate = useNavigate()
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    loadEbooks()
  }, [page, pageSize])

  const loadEbooks = async () => {
    setLoading(true)
    try {
      const res = await ebookApi.list({ page: page - 1, size: pageSize })
      const data = res.data?.data?.content || res.data || []
      setEbooks(data)
      setTotal(res.data?.data?.totalElements || data.length)
    } catch (error) {
      console.error('Failed to load ebooks:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>电子书</Title>
      <Spin spinning={loading}>
        {ebooks.length > 0 ? (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {ebooks.map((ebook) => (
                <Col span={6} key={ebook.id}>
                  <Card
                    hoverable
                    className="card-hover"
                    cover={
                      <div
                        style={{
                          height: 180,
                          background:
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 64,
                        }}
                      >
                        📖
                      </div>
                    }
                    onClick={() => navigate(`/ebooks/${ebook.id}`)}
                  >
                    <Card.Meta
                      title={ebook.title}
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            {ebook.creator?.username && (
                              <Tag color="blue">{ebook.creator.username}</Tag>
                            )}
                            <Tag color="green">{ebook.fileType}</Tag>
                          </div>
                          <div className="price-text">¥{ebook.price}</div>
                          <div
                            style={{
                              color: '#999',
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {ebook.wordCount || ebook.pageCount}
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
          <Empty description="暂无电子书" style={{ marginTop: 100 }} />
        )}
      </Spin>
    </div>
  )
}

export default EbookList
