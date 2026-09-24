import { useEffect, useState } from 'react'
import { Card, Statistic, List, Typography, Row, Col, Spin, Empty, Divider } from 'antd'
import { TrophyOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { pointsApi } from '../api/points'
import type { PointsAccount, PointsRecord } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography

function MyPoints() {
  const [account, setAccount] = useState<PointsAccount | null>(null)
  const [records, setRecords] = useState<PointsRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [accountRes, recordsRes] = await Promise.all([
        pointsApi.getBalance(),
        pointsApi.getRecords(),
      ])
      setAccount(accountRes.data?.data || accountRes.data)
      setRecords(recordsRes.data?.data?.content || recordsRes.data || [])
    } catch (error) {
      console.error('Failed to load points data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={2}>我的积分</Title>
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="当前积分"
                value={account?.balance || 0}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="累计获得"
                value={account?.totalEarned || 0}
                prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="累计消费"
                value={account?.totalSpent || 0}
                prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="积分明细">
          {records.length > 0 ? (
            <List
              dataSource={records}
              renderItem={(record) => (
                <List.Item>
                  <List.Item.Meta
                    title={record.reason}
                    description={dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      color: record.type === 'EARN' ? '#52c41a' : '#f5222d',
                    }}
                  >
                    {record.type === 'EARN' ? '+' : '-'}{record.points}
                  </span>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无积分记录" />
          )}
        </Card>
      </Spin>
    </div>
  )
}

export default MyPoints
