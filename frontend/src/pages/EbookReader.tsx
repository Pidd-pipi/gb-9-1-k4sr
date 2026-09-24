import { useEffect, useRef, useState } from 'react'
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
  Popover,
  List,
  Progress,
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
import type { Ebook, ReadingProgress } from '../types'

const { Title, Text } = Typography

interface LocalProgress {
  currentPage: number
  bookmarks: number[]
}

interface ConflictState {
  latest: ReadingProgress | null
  localPage: number
  localBookmarks: number[]
}

const localProgressKey = (ebookId: string) => `reading-progress:${ebookId}`
const nightModeKey = 'reader:night-mode'
const fontSizeKey = 'reader:font-size'

function readLocalProgress(ebookId: string, totalPages: number): LocalProgress {
  const fallback: LocalProgress = { currentPage: 1, bookmarks: [] }
  try {
    const raw = localStorage.getItem(localProgressKey(ebookId))
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      currentPage: Math.min(Math.max(1, Number(parsed.currentPage) || 1), totalPages),
      bookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks
            .map(Number)
            .filter((p: number) => Number.isInteger(p) && p >= 1 && p <= totalPages)
        : [],
    }
  } catch {
    return fallback
  }
}

function writeLocalProgress(ebookId: string, page: number, bookmarks: number[]) {
  try {
    localStorage.setItem(
      localProgressKey(ebookId),
      JSON.stringify({ currentPage: page, bookmarks })
    )
  } catch {
    // 本地存储不可用时不影响阅读
  }
}

function EbookReader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [fontSize, setFontSize] = useState(() =>
    Number(localStorage.getItem(fontSizeKey)) || 16
  )
  const [nightMode, setNightMode] = useState(
    () => localStorage.getItem(nightModeKey) === 'true'
  )
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [conflict, setConflict] = useState<ConflictState | null>(null)
  const [saving, setSaving] = useState(false)
  const [readPercent, setReadPercent] = useState(0)

  // 已登录用户与服务端同步时的基准版本号（打开时获取，保存成功后更新）
  const versionRef = useRef(0)
  const loggedInRef = useRef(false)
  const totalPagesRef = useRef(100)
  // 保存请求串行化：快速翻页时只保留最新状态，上一次返回后再发，避免同版本号并发误报冲突
  const savingRef = useRef(false)
  const pendingRef = useRef<{ page: number; bookmarks: number[] } | null>(null)
  const dirtyRef = useRef(false)
  const conflictOpenRef = useRef(false)

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
      const data: Ebook = res.data?.data || res.data
      setEbook(data)

      const totalPages = data.pageCount || 100
      totalPagesRef.current = totalPages
      const local = readLocalProgress(id, totalPages)

      const token = localStorage.getItem('token')
      loggedInRef.current = !!token
      if (token) {
        try {
          const progressRes = await ebookApi.getReadingProgress(id)
          const remote: ReadingProgress | null =
            progressRes.data?.data ?? progressRes.data ?? null
          if (remote) {
            // 已登录：以服务端（可能来自其他设备）的记录为准恢复
            const page = Math.min(Math.max(1, remote.currentPage || 1), totalPages)
            versionRef.current = remote.version || 0
            setCurrentPage(page)
            setBookmarks(remote.bookmarks || [])
            setReadPercent(remote.progressPercent || 0)
            writeLocalProgress(id, page, remote.bookmarks || [])
            return
          }
        } catch (error) {
          console.error('Failed to load reading progress:', error)
        }
      }

      // 未登录或没有服务端记录：恢复本机记录，退出后再次打开不再回到第一页
      versionRef.current = 0
      setCurrentPage(local.currentPage)
      setBookmarks(local.bookmarks)
      setReadPercent(
        totalPages > 0 ? Math.round((local.currentPage * 1000) / totalPages) / 10 : 0
      )
    } catch (error) {
      console.error('Failed to load ebook:', error)
    } finally {
      setLoading(false)
    }
  }

  // 保存页码和书签。未登录只保留本机记录；已登录带版本号串行提交，冲突时不覆盖较新记录。
  const persist = (page: number, nextBookmarks: number[]) => {
    if (!id) return
    writeLocalProgress(id, page, nextBookmarks)
    setReadPercent(
      totalPagesRef.current > 0
        ? Math.round((page * 1000) / totalPagesRef.current) / 10
        : 0
    )

    if (!loggedInRef.current) return

    pendingRef.current = { page, bookmarks: nextBookmarks }
    if (savingRef.current) {
      dirtyRef.current = true
      return
    }
    if (conflictOpenRef.current) return
    void flushSave()
  }

  const flushSave = async () => {
    if (!id || savingRef.current) return
    const pending = pendingRef.current
    if (!pending) return
    pendingRef.current = null
    dirtyRef.current = false
    savingRef.current = true
    setSaving(true)
    try {
      const res = await ebookApi.saveReadingProgress(id, {
        currentPage: pending.page,
        bookmarks: pending.bookmarks,
        version: versionRef.current,
      })
      const saved: ReadingProgress = res.data?.data || res.data
      if (saved) {
        versionRef.current = saved.version
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        // 另一台设备写入了新版本：提示冲突，原服务端记录已保留，不被旧请求覆盖
        const latest: ReadingProgress | null = error.response.data?.data ?? null
        conflictOpenRef.current = true
        setConflict({ latest, localPage: pending.page, localBookmarks: pending.bookmarks })
      } else if (error?.response?.status === 401) {
        // 登录态已失效：降级为仅本机保留，避免打断阅读
        loggedInRef.current = false
        message.warning('登录已失效，阅读进度暂时只保留在本机，重新登录后可继续同步')
      } else {
        // 保存失败时保留原有记录与本机状态，等下次翻页再重试，不立即重发
        pendingRef.current = pending
        message.error('阅读进度保存失败，将在下次翻页时重试')
      }
    } finally {
      savingRef.current = false
      setSaving(false)
      // 保存期间若又有翻页/书签操作，用最新版本号继续提交
      if (dirtyRef.current && !conflictOpenRef.current) {
        void flushSave()
      }
    }
  }

  const goToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPagesRef.current)
    setCurrentPage(target)
    persist(target, bookmarks)
  }

  const toggleBookmark = () => {
    const nextBookmarks = bookmarks.includes(currentPage)
      ? bookmarks.filter((p) => p !== currentPage)
      : [...bookmarks, currentPage].sort((a, b) => a - b)
    setBookmarks(nextBookmarks)
    message.info(
      nextBookmarks.includes(currentPage) ? '已添加书签' : '已取消书签'
    )
    persist(currentPage, nextBookmarks)
  }

  const jumpToBookmark = (page: number) => {
    setCurrentPage(page)
    persist(page, bookmarks)
  }

  const removeBookmark = (page: number) => {
    const nextBookmarks = bookmarks.filter((p) => p !== page)
    setBookmarks(nextBookmarks)
    persist(currentPage, nextBookmarks)
  }

  // 冲突处理：切换为另一台设备写入的最新进度
  const adoptRemoteProgress = () => {
    if (!conflict?.latest || !id) {
      conflictOpenRef.current = false
      setConflict(null)
      return
    }
    const latest = conflict.latest
    const totalPages = totalPagesRef.current
    const page = Math.min(Math.max(1, latest.currentPage || 1), totalPages)
    versionRef.current = latest.version
    setCurrentPage(page)
    setBookmarks(latest.bookmarks || [])
    setReadPercent(latest.progressPercent || 0)
    writeLocalProgress(id, page, latest.bookmarks || [])
    conflictOpenRef.current = false
    // 放弃冲突期间的本机待提交状态，避免再次用旧页码覆盖
    pendingRef.current = null
    setConflict(null)
    message.success('已切换为其他设备的最新阅读进度')
  }

  // 冲突处理：以本机页码和书签覆盖，基于最新版本重新提交
  const overwriteWithLocal = () => {
    if (!conflict) return
    if (conflict.latest) {
      versionRef.current = conflict.latest.version
    }
    const local = { page: conflict.localPage, bookmarks: conflict.localBookmarks }
    conflictOpenRef.current = false
    setConflict(null)
    pendingRef.current = local
    dirtyRef.current = false
    void flushSave()
  }

  const toggleNightMode = (checked: boolean) => {
    setNightMode(checked)
    localStorage.setItem(nightModeKey, String(checked))
  }

  const changeFontSize = (size: number) => {
    setFontSize(size)
    localStorage.setItem(fontSizeKey, String(size))
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

  const bookmarkContent = (
    <div style={{ minWidth: 200 }}>
      {bookmarks.length === 0 ? (
        <Text type="secondary">暂无书签</Text>
      ) : (
        <List
          size="small"
          dataSource={bookmarks}
          renderItem={(page) => (
            <List.Item
              actions={[
                <a key="jump" onClick={() => jumpToBookmark(page)}>
                  跳转
                </a>,
                <a key="remove" onClick={() => removeBookmark(page)}>
                  删除
                </a>,
              ]}
            >
              第 {page} 页
            </List.Item>
          )}
        />
      )}
    </div>
  )

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
            <Popover title="书签列表" content={bookmarkContent} trigger="click">
              <Button>书签列表 ({bookmarks.length})</Button>
            </Popover>
            <Button
              icon={nightMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => toggleNightMode(!nightMode)}
            >
              {nightMode ? '日间' : '夜间'}
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
              设置
            </Button>
          </Space>
        </div>
        <div style={{ marginTop: 8 }}>
          <Progress
            percent={readPercent}
            size="small"
            status="active"
            format={(p) => (saving ? `已读 ${p}% · 同步中…` : `已读 ${p}%`)}
          />
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
            onClick={() => goToPage(currentPage - 1)}
          >
            上一页
          </Button>
          <span>
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            disabled={currentPage >= sampleEndPage}
            icon={<RightOutlined />}
            onClick={() => goToPage(currentPage + 1)}
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
            onChange={changeFontSize}
            style={{ width: 200 }}
            options={fontSizeOptions}
          />
        </div>
        <div>
          <p style={{ marginBottom: 8 }}>夜间模式：</p>
          <Switch checked={nightMode} onChange={toggleNightMode} />
        </div>
      </Modal>

      <Modal
        title="阅读进度冲突"
        open={!!conflict}
        closable={false}
        maskClosable={false}
        okText="使用本机进度覆盖"
        cancelText="切换到最新进度"
        onOk={overwriteWithLocal}
        onCancel={adoptRemoteProgress}
      >
        <p>
          另一台设备已经保存了更新的阅读进度。为避免覆盖较新的页码和书签，本次保存未生效。
        </p>
        {conflict?.latest && (
          <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
            <p style={{ margin: 0 }}>
              其他设备：第 {conflict.latest.currentPage} 页
              {conflict.latest.bookmarks?.length
                ? `，书签 ${conflict.latest.bookmarks.length} 个`
                : '，暂无书签'}
            </p>
          </div>
        )}
        <p style={{ marginTop: 12, marginBottom: 0 }}>
          本机：第 {conflict?.localPage} 页
          {conflict?.localBookmarks.length
            ? `，书签 ${conflict.localBookmarks.length} 个`
            : '，暂无书签'}
        </p>
        <p style={{ color: '#999', marginTop: 12, marginBottom: 0 }}>
          选择「切换到最新进度」可从其他设备读到的位置继续；选择「使用本机进度覆盖」会用本机页码和书签替换云端记录。
        </p>
      </Modal>
    </div>
  )
}

export default EbookReader
