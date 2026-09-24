import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Button,
  Descriptions,
  Tag,
  Avatar,
  message,
  Spin,
} from 'antd'
import { ebookApi } from '../api/ebook'
import type { Ebook } from '../types'

const { Title, Paragraph } = Typography

function EbookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (id) {
      loadEbookDetail()
    }
  }, [id])

  const loadEbookDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await ebookApi.getById(id)
      setEbook(res.data?.data || res.data)
    } catch (error) {
      console.error('Failed to load ebook:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!id) return
    setPurchasing(true)
    try {
      await ebookApi.purchase(id)
      message.success('购买成功')
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading || !ebook) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  }

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 200,
              height: 280,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 96,
              flexShrink: 0,
            }}
          >
            📖
          </div>
          <div style={{ flex: 1 }}>
            <Title level={2}>{ebook.title}</Title>
            <div style={{ marginBottom: 16 }}>
              <Avatar icon={<span>👤</span>} src={ebook.creator?.avatar} />
              <span style={{ marginLeft: 8 }}>{ebook.creator?.username}</span>
              <Tag color="green" style={{ marginLeft: 8 }}>
                {ebook.fileType}
              </Tag>
            </div>
            <Paragraph type="secondary">{ebook.description}</Paragraph>
            <Descriptions column={2} style={{ marginTop: 16 }}>
              {ebook.pageCount && (
                <Descriptions.Item label="页数">{ebook.pageCount}</Descriptions.Item>
              )}
              {ebook.wordCount && (
                <Descriptions.Item label="字数">{ebook.wordCount}字</Descriptions.Item>
              )}
              <Descriptions.Item label="试读">
                前{ebook.sampleEndPercent * 100}%免费
              </Descriptions.Item>
              <Descriptions.Item label="价格" className="price-text">
                ¥{ebook.price}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, gap: 12, display: 'flex' }}>
              <Button type="primary" size="large" onClick={handlePurchase} loading={purchasing}>
                立即购买
              </Button>
              <Button size="large" onClick={() => navigate(`/ebooks/read/${ebook.id}`)}>
                免费试读
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EbookDetail
