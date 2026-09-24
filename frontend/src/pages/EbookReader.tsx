import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Space,
  Switch,
  Select,
  Typography,
  message,
  Spin,
  Modal,
} from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  PushpinOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { ebookApi } from '../api/ebook'
import type { Ebook } from '../types'

const { Title } = Typography

function EbookReader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [fontSize, setFontSize] = useState(16)
  const [nightMode, setNightMode] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [settingsVisible, setSettingsVisible] = useState(false)

  useEffect(() => {
    if (id) {
      loadEbook()
    }
  }, [id])

  const loadEbook = async () => {
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

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter((p) => p !== currentPage))
      message.info('已取消书签')
    } else {
      setBookmarks([...bookmarks, currentPage])
      message.success('已添加书签')
    }
  }

  const totalPages = ebook?.pageCount || 100
  const sampleEndPage = Math.floor(totalPages * (ebook?.sampleEndPercent || 0.1))

  const canRead = currentPage <= sampleEndPage

  const fontSizeOptions = [
    { value: 12, label: '小' },
    { value: 14, label: '较小' },
    { value: 16, label: '中' },
    { value: 18, label: '较大' },
    { value: 20, label: '大' },
  ]

  if (loading || !ebook) {
    return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
  }

  return (
    <div style={{ padding: 0 }}>
      <Card
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: nightMode ? '#141414' : '#fff',
          color: nightMode ? '#fff' : 'inherit',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/ebooks/${ebook.id}`)}>
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {ebook.title}
            </Title>
          </Space>
          <Space>
            <Button
              icon={<PushpinOutlined />}
              onClick={toggleBookmark}
              type={bookmarks.includes(currentPage) ? 'primary' : 'default'}
            >
              书签
            </Button>
            <Button
              icon={nightMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => setNightMode(!nightMode)}
            >
              {nightMode ? '日间' : '夜间'}
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
              设置
            </Button>
          </Space>
        </div>
      </Card>

      <div
        style={{
          padding: 48,
          minHeight: 'calc(100vh - 200px)',
          background: nightMode ? '#1f1f1f' : '#fafafa',
          color: nightMode ? '#d9d9d9' : '#333',
          fontSize: `${fontSize}px`,
          lineHeight: 1.8,
        }}
      >
        {canRead ? (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2>第 {currentPage} 页</h2>
            </div>
            <p style={{ textIndent: '2em' }}>
              这是《{ebook.title}》的第 {currentPage} 页内容。在实际应用中，这里会显示真实的电子书内容。
              阅读器支持翻页、字体大小调节、夜间模式、书签标记和阅读进度记忆等功能。
            </p>
            <p style={{ textIndent: '2em' }}>
              前 {sampleEndPage} 页可免费试读，完整内容需要购买后才能阅读。
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 100 }}>
            <Title level={3}>试读结束</Title>
            <p style={{ margin: '24px 0' }}>
              您已阅读到试读部分的末尾，购买后可继续阅读完整内容。
            </p>
            <Button type="primary" size="large" onClick={() => navigate(`/ebooks/${ebook.id}`)}>
              购买整本电子书
            </Button>
          </div>
        )}
      </div>

      <Card style={{ position: 'sticky', bottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={currentPage <= 1}
            icon={<LeftOutlined />}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            上一页
          </Button>
          <span>
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            disabled={currentPage >= sampleEndPage}
            icon={<RightOutlined />}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </Button>
        </div>
      </Card>

      <Modal
        title="阅读设置"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: 24 }}>
          <p style={{ marginBottom: 8 }}>字体大小：</p>
          <Select
            value={fontSize}
            onChange={setFontSize}
            style={{ width: 200 }}
            options={fontSizeOptions}
          />
        </div>
        <div>
          <p style={{ marginBottom: 8 }}>夜间模式：</p>
          <Switch checked={nightMode} onChange={setNightMode} />
        </div>
      </Modal>
    </div>
  )
}

export default EbookReader
