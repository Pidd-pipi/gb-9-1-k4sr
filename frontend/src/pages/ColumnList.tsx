import { useEffect, useState } from 'react'
import { Row, Col, Card, Tag, Pagination, Typography, Spin, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { columnApi } from '../api/column'
import type { Column } from '../types'

const { Title } = Typography

function ColumnList() {
  const navigate = useNavigate()
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    loadColumns()
  }, [page, pageSize])

  const loadColumns = async () => {
    setLoading(true)
    try {
      const res = await columnApi.list({ page: page - 1, size: pageSize })
      const data = res.data?.data?.content || res.data || []
      setColumns(data)
      setTotal(res.data?.data?.totalElements || data.length)
    } catch (error) {
      console.error('Failed to load columns:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>付费专栏</Title>
      <Spin spinning={loading}>
        {columns.length > 0 ? (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {columns.map((column) => (
                <Col span={6} key={column.id}>
                  <Card
                    hoverable
                    className="card-hover"
                    cover={
                      <div
                        style={{
                          height: 180,
                          background:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 64,
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
                          <div style={{ marginBottom: 8 }}>
                            {column.creator?.username && (
                              <Tag color="blue">{column.creator.username}</Tag>
                            )}
                            <Tag color="purple">{column.category}</Tag>
                          </div>
                          <div className="price-text">¥{column.monthlyPrice}/月</div>
                          <div
                            style={{
                              color: '#999',
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {column.articleCount}篇文章 · {column.subscriberCount}订阅
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
          <Empty description="暂无专栏" style={{ marginTop: 100 }} />
        )}
      </Spin>
    </div>
  )
}

export default ColumnList
