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
  Alert,
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
import { useSelector } from 'react-redux'
import { ebookApi } from '../api/ebook'
import type { Ebook, ReadingProgress } from '../types'
import type { RootState } from '../store'

const { Title } = Typography

interface LocalProgress {
  currentPage: number
  bookmarks: number[]
}

const guestStorageKey = (ebookId: string) => `reading-progress-guest:${ebookId}`
const settingStorageKey = (ebookId: string) => `reading-settings:${ebookId}`

function readLocalProgress(ebookId: string, fallbackTotal: number): LocalProgress {
  try {
    const raw = localStorage.getItem(guestStorageKey(ebookId))
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalProgress>
      const currentPage = Math.min(
        Math.max(1, Number(parsed.currentPage) || 1),
        fallbackTotal
      )
      const bookmarks = Array.isArray(parsed.bookmarks)
        ? [
            ...new Set(
              parsed.bookmarks.filter((p) => p >= 1 && p <= fallbackTotal)
            ),
          ]
        : []
      return { currentPage, bookmarks }
    }
  } catch {
    // ignore broken cache
  }
  return { currentPage: 1, bookmarks: [] }
}

function readLocalSettings(ebookId: string): { fontSize: number; nightMode: boolean } {
  try {
    const raw = localStorage.getItem(settingStorageKey(ebookId))
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        fontSize: parsed.fontSize || 16,
        nightMode: !!parsed.nightMode,
      }
    }
  } catch {
    // ignore broken cache
  }
  return { fontSize: 16, nightMode: false }
}

function EbookReader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state: RootState) => !!state.auth.token)

  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [fontSize, setFontSize] = useState(16)
  const [nightMode, setNightMode] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [settingsVisible, setSettingsVisible] = useState(false)
  // 冲突未解决期间暂停自动同步，避免旧版本号反复请求
  const [conflict, setConflict] = useState<ReadingProgress | null>(null)
  const [saveError, setSaveError] = useState(false)

  // 打开时获取到的服务端版本号，后续保存请求必须原样带回
  const versionRef = useRef<number | null>(null)
  const conflictRef = useRef<ReadingProgress | null>(null)
  const isLoggedInRef = useRef(isLoggedIn)
  isLoggedInRef.current = isLoggedIn
  const ebookIdRef = useRef(id)
  ebookIdRef.current = id
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 用 ref 保存最新状态，保证防抖/卸载回调里读到的始终是当前页码和书签
  const stateRef = useRef({ currentPage, bookmarks })
  stateRef.current = { currentPage, bookmarks }

  const totalPages = ebook?.pageCount || 100
  const sampleEndPage = Math.floor(totalPages * (ebook?.sampleEndPercent || 0.1))
  const canRead = currentPage <= sampleEndPage
  const readPercent = Math.min(100, Math.round((currentPage / totalPages) * 100))

  const fontSizeOptions = [
    { value: 12, label: '小' },
    { value: 14, label: '较小' },
    { value: 16, label: '中' },
    { value: 18, label: '较大' },
    { value: 20, label: '大' },
  ]

  const persistGuest = (page: number, marks: number[]) => {
    const ebookId = ebookIdRef.current
    if (!ebookId) return
    try {
      localStorage.setItem(
        guestStorageKey(ebookId),
        JSON.stringify({ currentPage: page, bookmarks: marks })
      )
    } catch {
      // localStorage 不可用时静默忽略，不影响阅读
    }
  }

  const flushSaveRef = useRef<() => Promise<void>>(async () => {})

  // 打开阅读器：恢复上次页码和书签
  useEffect(() => {
    if (!id) return
    let cancelled = false

    const init = async () => {
      setLoading(true)
      try {
        const res = await ebookApi.getById(id)
        const book: Ebook = res.data?.data || res.data
        if (cancelled) return
        setEbook(book)

        const total = book.pageCount || 100
        const savedSettings = readLocalSettings(id)
        setFontSize(savedSettings.fontSize)
        setNightMode(savedSettings.nightMode)

        if (isLoggedInRef.current) {
          // 登录用户：从服务端恢复（多台设备共享同一账号记录）
          try {
            const progressRes = await ebookApi.getProgress(id)
            if (cancelled) return
            const progress: ReadingProgress | null = progressRes.data?.data ?? null
            if (progress) {
              versionRef.current = progress.version ?? null
              setCurrentPage(
                Math.min(Math.max(1, progress.currentPage || 1), total)
              )
              setBookmarks(
                (progress.bookmarks || []).filter((p) => p >= 1 && p <= total)
              )
            }
          } catch {
            // 进度接口失败不影响阅读，从第一页开始；保存时按首次保存处理
            versionRef.current = null
          }
        } else {
          // 未登录：仅保留本机记录，不同步、不覆盖账号数据
          const local = readLocalProgress(id, total)
          setCurrentPage(local.currentPage)
          setBookmarks(local.bookmarks)
        }
      } catch (error) {
        console.error('Failed to load ebook:', error)
        message.error('电子书加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [id])

  // 初始化完成标记放在恢复 setState 的 effect 之后执行，
  // 因此恢复页码/书签触发的 effect 不会被当成用户操作而误发保存
  const [inited, setInited] = useState(false)
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setInited(true), 0)
      return () => clearTimeout(t)
    }
  }, [loading])
  const initedRef = useRef(false)
  initedRef.current = inited

  // 字体、夜间模式属于本机偏好，独立保存，不与账号阅读进度混在一起
  useEffect(() => {
    if (!id || !ebook) return
    try {
      localStorage.setItem(
        settingStorageKey(id),
        JSON.stringify({ fontSize, nightMode })
      )
    } catch {
      // ignore
    }
  }, [id, ebook, fontSize, nightMode])

  flushSaveRef.current = async () => {
    const ebookId = ebookIdRef.current
    if (!ebookId || !isLoggedInRef.current || conflictRef.current) return
    savingRef.current = true
    dirtyRef.current = false
    setSaveError(false)
    const { currentPage: page, bookmarks: marks } = stateRef.current
    try {
      const res = await ebookApi.saveProgress(ebookId, {
        currentPage: page,
        bookmarks: marks,
        expectedVersion: versionRef.current,
      })
      const saved = res.data.data
      versionRef.current = saved.version
      setSaveError(false)
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 409) {
        // 另一台设备已写入新版本：本次旧请求没有覆盖，交给用户决定
        const latest: ReadingProgress | null = error.response?.data?.data ?? null
        conflictRef.current = latest
        setConflict(latest)
      } else if (status === 400) {
        // 页码越界等被服务端拒绝：保留原记录，不自动重试
        message.error(error.response?.data?.message || '页码非法，未保存')
      } else {
        // 网络/服务异常：保留云端原记录，标记失败，下次操作时重试
        dirtyRef.current = true
        setSaveError(true)
      }
    } finally {
      savingRef.current = false
    }
  }

  const scheduleSave = () => {
    if (!initedRef.current || !ebookIdRef.current) return
    if (!isLoggedInRef.current) {
      persistGuest(
        stateRef.current.currentPage,
        stateRef.current.bookmarks
      )
      return
    }
    if (conflictRef.current) return
    dirtyRef.current = true
    setSaveError(false)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    // 连续翻页时防抖，停止操作后再同步
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null
      void flushSaveRef.current()
    }, 800)
  }

  // 翻页或书签变化（页码恢复在 inited 置位前完成，不会误触发）
  useEffect(() => {
    scheduleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  useEffect(() => {
    scheduleSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks])

  // 退出阅读器时尽量把最后一次变更发出去（最新状态从 ref 读取）
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      if (
        initedRef.current &&
        isLoggedInRef.current &&
        dirtyRef.current &&
        !savingRef.current &&
        !conflictRef.current
      ) {
        void flushSaveRef.current()
      }
    }
  }, [])

  const goPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages)
    if (target === currentPage) return
    setCurrentPage(target)
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

  // 冲突处理：采用服务端较新的页码和书签，并以新版本号继续同步
  const acceptLatest = () => {
    const latest = conflictRef.current
    if (latest) {
      versionRef.current = latest.version ?? null
      setCurrentPage(latest.currentPage || 1)
      setBookmarks(latest.bookmarks || [])
      message.success('已加载其他设备上的最新进度')
    }
    conflictRef.current = null
    setConflict(null)
  }

  // 冲突处理：保留本机页码和书签，基于服务端最新版本号发起一次新的覆盖写入
  const overwriteLatest = () => {
    const latest = conflictRef.current
    if (latest) {
      versionRef.current = latest.version ?? null
    }
    conflictRef.current = null
    setConflict(null)
    dirtyRef.current = true
    void flushSaveRef.current()
  }

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
              书签{bookmarks.length > 0 ? ` (${bookmarks.length})` : ''}
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

      {!isLoggedIn && (
        <Alert
          type="info"
          showIcon
          message="未登录状态：阅读进度仅保存在本设备，登录后可在多台设备间同步"
          style={{ margin: '12px 24px 0' }}
        />
      )}
      {conflict && (
        <Alert
          type="warning"
          showIcon
          style={{ margin: '12px 24px 0' }}
          message={`检测到其他设备上的更新（第 ${conflict.currentPage} 页），当前保存未覆盖云端记录`}
          description="为避免覆盖较新的页码和书签，请选择加载云端最新进度，或用本机进度覆盖。"
          action={
            <Space direction="vertical">
              <Button size="small" type="primary" onClick={acceptLatest}>
                加载最新进度
              </Button>
              <Button size="small" onClick={overwriteLatest}>
                用本机进度覆盖
              </Button>
            </Space>
          }
        />
      )}
      {saveError && !conflict && (
        <Alert
          type="error"
          showIcon
          style={{ margin: '12px 24px 0' }}
          message="进度保存失败，将在下次翻页时重试；云端记录保持不变"
        />
      )}

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
            {bookmarks.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <span>书签页：</span>
                {bookmarks
                  .slice()
                  .sort((a, b) => a - b)
                  .map((p) => (
                    <Button
                      key={p}
                      size="small"
                      type={p === currentPage ? 'primary' : 'default'}
                      style={{ margin: '0 4px' }}
                      onClick={() => goPage(p)}
                    >
                      第 {p} 页
                    </Button>
                  ))}
              </div>
            )}
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
            onClick={() => goPage(currentPage - 1)}
          >
            上一页
          </Button>
          <div style={{ flex: 1, maxWidth: 360, margin: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              第 {currentPage} / {totalPages} 页 · 已读 {readPercent}%
              {isLoggedIn ? ' · 云端同步' : ' · 本机保存'}
            </div>
            <Progress percent={readPercent} size="small" showInfo={false} />
          </div>
          <Button
            disabled={currentPage >= sampleEndPage}
            icon={<RightOutlined />}
            onClick={() => goPage(currentPage + 1)}
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
