import { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Button, Tag, Modal, message, Spin, Empty } from 'antd'
import { GiftOutlined } from '@ant-design/icons'
import { pointsApi } from '../api/points'
import type { MallItem, PointsAccount } from '../types'

const { Title } = Typography

function PointsMall() {
  const [items, setItems] = useState<MallItem[]>([])
  const [account, setAccount] = useState<PointsAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [redeemModalVisible, setRedeemModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MallItem | null>(null)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [itemsRes, accountRes] = await Promise.all([
        pointsApi.getMallItems(),
        pointsApi.getBalance(),
      ])
      setItems(itemsRes.data?.data?.content || itemsRes.data || [])
      setAccount(accountRes.data?.data || accountRes.data)
    } catch (error) {
      console.error('Failed to load mall items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!selectedItem) return
    setRedeeming(true)
    try {
      await pointsApi.redeem(selectedItem.id)
      message.success('兑换成功')
      setRedeemModalVisible(false)
      loadData()
    } catch (error) {
      console.error('Redeem failed:', error)
    } finally {
      setRedeeming(false)
    }
  }

  const canRedeem = (item: MallItem) => {
    return (account?.balance || 0) >= item.pointsCost && item.stock > 0
  }

  const getTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      COUPON: 'orange',
      AUDIO: 'purple',
      EBOOK: 'blue',
    }
    const labels: Record<string, string> = {
      COUPON: '优惠券',
      AUDIO: '音频课程',
      EBOOK: '电子书',
    }
    return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>积分商城</Title>
        {account && (
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <GiftOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div>
                <div style={{ fontSize: 12, color: '#999' }}>我的积分</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#faad14' }}>
                  {account.balance}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Spin spinning={loading}>
        {items.length > 0 ? (
          <Row gutter={[16, 16]}>
            {items.map((item) => (
              <Col span={6} key={item.id}>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 48,
                      }}
                    >
                      🎁
                    </div>
                  }
                  actions={[
                    <Button
                      type="primary"
                      disabled={!canRedeem(item)}
                      onClick={() => {
                        setSelectedItem(item)
                        setRedeemModalVisible(true)
                      }}
                    >
                      立即兑换
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={item.name}
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>{getTypeTag(item.type)}</div>
                        <div style={{ fontWeight: 600, color: '#faad14' }}>
                          {item.pointsCost} 积分
                        </div>
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                          库存：{item.stock}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无商品" style={{ marginTop: 100 }} />
        )}
      </Spin>

      <Modal
        title="确认兑换"
        open={redeemModalVisible}
        onOk={handleRedeem}
        onCancel={() => setRedeemModalVisible(false)}
        confirmLoading={redeeming}
        okText="确认兑换"
        cancelText="取消"
      >
        {selectedItem && (
          <div>
            <p>
              商品：<strong>{selectedItem.name}</strong>
            </p>
            <p>
              积分：<span style={{ color: '#faad14', fontWeight: 600 }}>{selectedItem.pointsCost} 积分</span>
            </p>
            <p>
              当前积分：{account?.balance || 0}
            </p>
            <p type="secondary" style={{ color: '#999' }}>
              兑换后积分将从您的账户中扣除，请确认是否继续。
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PointsMall
