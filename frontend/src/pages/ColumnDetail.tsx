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
  Radio,
  Modal,
  message,
  Spin,
} from 'antd'
import { columnApi } from '../api/column'
import type { Column, Article } from '../types'

const { Title, Text, Paragraph } = Typography

function ColumnDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [column, setColumn] = useState<Column | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [subscribeModalVisible, setSubscribeModalVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (id) {
      loadColumnDetail()
    }
  }, [id])

  const loadColumnDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [columnRes, articlesRes] = await Promise.all([
        columnApi.getById(id),
        columnApi.getArticles(id),
      ])
      setColumn(columnRes.data?.data || columnRes.data)
      setArticles(articlesRes.data?.data?.content || articlesRes.data || [])
    } catch (error) {
      console.error('Failed to load column:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!id) return
    setSubscribing(true)
    try {
      await columnApi.subscribe(id, selectedPlan)
      message.success('订阅成功')
      setSubscribeModalVisible(false)
    } catch (error) {
      console.error('Subscribe failed:', error)
    } finally {
      setSubscribing(false)
    }
  }

  const planOptions = column
    ? [
        { label: `月付 ¥${column.monthlyPrice}`, value: 'MONTHLY' },
        { label: `季付 ¥${column.quarterlyPrice}`, value: 'QUARTERLY' },
        { label: `年付 ¥${column.yearlyPrice}`, value: 'YEARLY' },
      ]
    : []

  if (loading || !column) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 240,
              height: 320,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 96,
              flexShrink: 0,
            }}
          >
            📚
          </div>
          <div style={{ flex: 1 }}>
            <Title level={2}>{column.title}</Title>
            <div style={{ marginBottom: 16 }}>
              <Avatar icon={<span>👤</span>} src={column.creator?.avatar} />
              <Text style={{ marginLeft: 8 }}>{column.creator?.username}</Text>
              <Tag color="purple" style={{ marginLeft: 8 }}>
                {column.category}
              </Tag>
            </div>
            <Paragraph type="secondary">{column.description}</Paragraph>
            <Descriptions column={3} style={{ marginTop: 16 }}>
              <Descriptions.Item label="文章数">{column.articleCount}</Descriptions.Item>
              <Descriptions.Item label="订阅数">{column.subscriberCount}</Descriptions.Item>
              <Descriptions.Item label="月付价格" className="price-text">
                ¥{column.monthlyPrice}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                onClick={() => setSubscribeModalVisible(true)}
              >
                立即订阅
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="文章列表" style={{ marginTop: 24 }}>
        <List
          dataSource={articles}
          renderItem={(article, index) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  key="read"
                  onClick={() => navigate(`/columns/${id}/articles/${article.id}`)}
                >
                  阅读
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Text type="secondary" style={{ marginRight: 12 }}>
                      #{index + 1}
                    </Text>
                    {article.title}
                  </span>
                }
                description={article.summary || article.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="选择订阅计划"
        open={subscribeModalVisible}
        onOk={handleSubscribe}
        onCancel={() => setSubscribeModalVisible(false)}
        confirmLoading={subscribing}
        okText="确认订阅"
        cancelText="取消"
      >
        <Radio.Group
          value={selectedPlan}
          onChange={(e) =>
            setSelectedPlan(e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY')
          }
          style={{ width: '100%' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planOptions.map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </div>
        </Radio.Group>
      </Modal>
    </div>
  )
}

export default ColumnDetail
