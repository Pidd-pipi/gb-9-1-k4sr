import { useEffect, useState } from 'react'
import { Card, List, Typography, Tag, Button, Spin, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { columnApi } from '../api/column'
import type { Subscription } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography

function MySubscriptions() {
  const navigate = useNavigate()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const res = await columnApi.mySubscriptions()
      setSubscriptions(res.data?.data?.content || res.data || [])
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      MONTHLY: '月付',
      QUARTERLY: '季付',
      YEARLY: '年付',
    }
    return labels[plan] || plan
  }

  const isExpired = (endDate: string) => {
    return dayjs(endDate).isBefore(dayjs())
  }

  return (
    <div>
      <Title level={2}>我的订阅</Title>
      <Spin spinning={loading}>
        {subscriptions.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={subscriptions}
            renderItem={(sub) => (
              <List.Item>
                <Card
                  hoverable
                  actions={[
                    <Button
                      type="link"
                      key="view"
                      onClick={() => navigate(`/columns/${sub.columnId}`)}
                    >
                      查看专栏
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{sub.column?.title}</span>
                        {isExpired(sub.endDate) ? (
                          <Tag color="red">已过期</Tag>
                        ) : (
                          <Tag color="green">有效</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          <Tag color="purple">{getPlanLabel(sub.plan)}</Tag>
                        </div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          开始：{dayjs(sub.startDate).format('YYYY-MM-DD')}
                        </div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          到期：{dayjs(sub.endDate).format('YYYY-MM-DD')}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无订阅" style={{ marginTop: 100 }} />
        )}
      </Spin>
    </div>
  )
}

export default MySubscriptions
