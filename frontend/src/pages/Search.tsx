import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, Typography, List, Tag, Input, Empty, Spin } from 'antd'
import { BookOutlined, SoundOutlined, ReadOutlined, FileTextOutlined } from '@ant-design/icons'
import { searchApi } from '../api/search'
import type { SearchResult } from '../types'

const { Title } = Typography
const { Search: SearchInput } = Input

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState(query)

  useEffect(() => {
    if (query) {
      loadResults()
    }
  }, [query])

  const loadResults = async () => {
    if (!query) return
    setLoading(true)
    try {
      const res = await searchApi.search(query)
      setResults(res.data?.data?.content || res.data || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim() })
    }
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      COLUMN: <BookOutlined style={{ color: '#722ed1' }} />,
      ARTICLE: <FileTextOutlined style={{ color: '#722ed1' }} />,
      AUDIO: <SoundOutlined style={{ color: '#eb2f96' }} />,
      EBOOK: <ReadOutlined style={{ color: '#13c2c2' }} />,
    }
    return icons[type] || <FileTextOutlined />
  }

  const getTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      COLUMN: 'purple',
      ARTICLE: 'purple',
      AUDIO: 'magenta',
      EBOOK: 'cyan',
    }
    const labels: Record<string, string> = {
      COLUMN: '专栏',
      ARTICLE: '文章',
      AUDIO: '音频',
      EBOOK: '电子书',
    }
    return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>
  }

  const getDetailUrl = (result: SearchResult) => {
    switch (result.type) {
      case 'COLUMN':
        return `/columns/${result.id}`
      case 'ARTICLE':
        return `/columns/article/${result.id}`
      case 'AUDIO':
        return `/audio/${result.id}`
      case 'EBOOK':
        return `/ebooks/${result.id}`
      default:
        return '/'
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          搜索
        </Title>
        <SearchInput
          placeholder="搜索专栏、音频、电子书..."
          allowClear
          enterButton="搜索"
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 600, margin: '0 auto', display: 'block' }}
        />
      </Card>

      {query && (
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            搜索 "{query}" 的结果
          </Title>
          <Spin spinning={loading}>
            {results.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={results}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: 16 }}
                    onClick={() => navigate(getDetailUrl(item))}
                    className="card-hover"
                  >
                    <List.Item.Meta
                      avatar={<div style={{ fontSize: 24 }}>{getTypeIcon(item.type)}</div>}
                      title={
                        <div>
                          {item.title}
                          <span style={{ marginLeft: 8 }}>{getTypeTag(item.type)}</span>
                        </div>
                      }
                      description={item.summary}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="未找到相关内容" style={{ marginTop: 50 }} />
            )}
          </Spin>
        </div>
      )}
    </div>
  )
}

export default Search
