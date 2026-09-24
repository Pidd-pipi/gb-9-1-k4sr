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
  Progress,
} from 'antd'
import { useSelector } from 'react-redux'
import { ebookApi } from '../api/ebook'
import type { Ebook, ReadingProgress } from '../types'
import type { RootState } from '../store'

const { Title, Paragraph } = Typography

interface GuestProgress {
  currentPage: number
  bookmarks: number[]
}

function readGuestProgress(id: string): GuestProgress | null {
  try {
    const raw = localStorage.getItem(`reading-progress-guest:${id}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        currentPage: Number(parsed.currentPage) || 1,
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      }
    }
  } catch {
    // ignore
  }
  return null
}

function EbookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.token)
  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [progress, setProgress] = useState<ReadingProgress | null>(null)
  const [guestProgress, setGuestProgress] = useState<GuestProgress | null>(null)

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
      const book: Ebook = res.data?.data || res.data
      setEbook(book)

      if (isLoggedIn) {
        try {
          const progressRes = await ebookApi.getProgress(id)
          setProgress(progressRes.data?.data ?? null)
        } catch {
          // 进度查询失败不影响详情页展示
        }
      } else {
        setGuestProgress(readGuestProgress(id))
      }
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

  const totalPages = ebook.pageCount || 100
  const savedPage = progress?.currentPage ?? guestProgress?.currentPage
  const readPercent = progress?.progressPercent
    ?? (savedPage ? Math.min(100, Math.round((savedPage / totalPages) * 100)) : 0)
  const bookmarkCount = progress?.bookmarks?.length ?? guestProgress?.bookmarks?.length ?? 0
  const hasProgress = !!savedPage && savedPage > 1

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

            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: '#fafafa',
                borderRadius: 8,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                {hasProgress ? (
                  <>
                    <span>
                      已读 {readPercent}% · 读到第 {savedPage} / {totalPages} 页
                      {bookmarkCount > 0 ? ` · ${bookmarkCount} 个书签` : ''}
                    </span>
                    {!isLoggedIn && (
                      <Tag color="default" style={{ marginLeft: 8 }}>
                        本机记录
                      </Tag>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#999' }}>暂无阅读记录</span>
                )}
              </div>
              <Progress percent={readPercent} size="small" />
            </div>

            <div style={{ marginTop: 24, gap: 12, display: 'flex' }}>
              <Button type="primary" size="large" onClick={handlePurchase} loading={purchasing}>
                立即购买
              </Button>
              <Button
                size="large"
                type={hasProgress ? 'primary' : 'default'}
                ghost={hasProgress}
                onClick={() => navigate(`/ebooks/read/${ebook.id}`)}
              >
                {hasProgress ? `继续阅读（第 ${savedPage} 页）` : '免费试读'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EbookDetail
