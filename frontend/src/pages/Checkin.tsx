import { useState, useEffect } from 'react'
import { Card, Typography, Button, message, Calendar, Statistic, Row, Col, Tag, Spin } from 'antd'
import { CheckCircleOutlined, TrophyOutlined, CalendarOutlined } from '@ant-design/icons'
import { pointsApi } from '../api/points'
import type { PointsAccount, PointsRecord } from '../types'
import dayjs from 'dayjs'

const { Title, Text } = Typography

function Checkin() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkedToday, setCheckedToday] = useState(false)
  const [account, setAccount] = useState<PointsAccount | null>(null)
  const [recentRecords, setRecentRecords] = useState<PointsRecord[]>([])

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
      const records = recordsRes.data?.data?.content || recordsRes.data || []
      setRecentRecords(records.slice(0, 5))
      const today = dayjs().format('YYYY-MM-DD')
      const checked = records.some(
        (r: PointsRecord) =>
          r.reason.includes('签到') && dayjs(r.createdAt).format('YYYY-MM-DD') === today
      )
      setCheckedToday(checked)
    } catch (error) {
      console.error('Failed to load checkin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (checkedToday) {
      message.info('今天已经签到过了')
      return
    }
    setChecking(true)
    try {
      await pointsApi.checkin()
      message.success('签到成功！+5积分')
      setCheckedToday(true)
      loadData()
    } catch (error) {
      message.error('签到失败，请重试')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Spin spinning={loading}>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>每日签到</Title>
            <div style={{ fontSize: 64, margin: 24 }}>
              {checkedToday ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CalendarOutlined style={{ color: '#1890ff' }} />
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              {checkedToday ? (
                <div>
                  <Tag color="green" style={{ fontSize: 16, padding: '8px 16px' }}>
                    今日已签到 +5积分
                  </Tag>
                </div>
              ) : (
                <div>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    签到即可获得 5 积分，连续签到还有更多奖励哦~
                  </Text>
                </div>
              )}
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleCheckin}
              loading={checking}
              disabled={checkedToday}
              style={{ minWidth: 200, height: 48, fontSize: 18 }}
            >
              {checkedToday ? '已签到' : '立即签到'}
            </Button>
          </div>
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="当前积分"
                value={account?.balance || 0}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="累计获得"
                value={account?.totalEarned || 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="最近积分记录">
          {recentRecords.length > 0 ? (
            recentRecords.map((record) => (
              <div
                key={record.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{record.reason}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    color: record.type === 'EARN' ? '#52c41a' : '#f5222d',
                  }}
                >
                  {record.type === 'EARN' ? '+' : '-'}{record.points}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 24 }}>
              暂无积分记录
            </div>
          )}
        </Card>
      </Spin>
    </div>
  )
}

export default Checkin
