import { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, Statistic, Button, List, Avatar, Tag, message, Spin, Modal, Form, Input, Select, Upload } from 'antd'
import { BookOutlined, SoundOutlined, ReadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { creatorApi } from '../api/creator'
import { columnApi } from '../api/column'
import { audioApi } from '../api/audio'
import { ebookApi } from '../api/ebook'
import type { Column, AudioCourse, Ebook } from '../types'

const { Title } = Typography
const { TextArea } = Input

function CreatorDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState<Column[]>([])
  const [audio, setAudio] = useState<AudioCourse[]>([])
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [columnModalVisible, setColumnModalVisible] = useState(false)
  const [audioModalVisible, setAudioModalVisible] = useState(false)
  const [ebookModalVisible, setEbookModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [columnForm] = Form.useForm()
  const [audioForm] = Form.useForm()
  const [ebookForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [columnsRes, audioRes, ebooksRes] = await Promise.all([
        columnApi.list({ size: 10 }),
        audioApi.list({ size: 10 }),
        ebookApi.list({ size: 10 }),
      ])
      setColumns(columnsRes.data?.data?.content || columnsRes.data || [])
      setAudio(audioRes.data?.data?.content || audioRes.data || [])
      setEbooks(ebooksRes.data?.data?.content || ebooksRes.data || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateColumn = async () => {
    setSubmitting(true)
    try {
      const values = await columnForm.validateFields()
      await columnApi.create(values)
      message.success('专栏创建成功')
      setColumnModalVisible(false)
      columnForm.resetFields()
      loadData()
    } catch (error) {
      console.error('Create column failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAudio = async () => {
    setSubmitting(true)
    try {
      const values = await audioForm.validateFields()
      await audioApi.create(values)
      message.success('音频课程创建成功')
      setAudioModalVisible(false)
      audioForm.resetFields()
      loadData()
    } catch (error) {
      console.error('Create audio failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateEbook = async () => {
    setSubmitting(true)
    try {
      const values = await ebookForm.validateFields()
      await ebookApi.create(values)
      message.success('电子书创建成功')
      setEbookModalVisible(false)
      ebookForm.resetFields()
      loadData()
    } catch (error) {
      console.error('Create ebook failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>创作者中心</Title>
        <div style={{ gap: 12, display: 'flex' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setColumnModalVisible(true)}>
            发布专栏
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAudioModalVisible(true)}>
            发布音频课程
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEbookModalVisible(true)}>
            发布电子书
          </Button>
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="专栏数量" value={columns.length} prefix={<BookOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="音频课程" value={audio.length} prefix={<SoundOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="电子书" value={ebooks.length} prefix={<ReadOutlined />} />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Card title="我的专栏" style={{ marginBottom: 24 }}>
          <List
            dataSource={columns}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="edit" onClick={() => navigate(`/columns/${item.id}`)}>
                    查看
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<BookOutlined />} style={{ background: '#722ed1' }} />}
                  title={item.title}
                  description={
                    <div>
                      <Tag color="purple">¥{item.monthlyPrice}/月</Tag>
                      <Tag>{item.articleCount}篇文章</Tag>
                      <Tag>{item.subscriberCount}订阅</Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="我的音频课程" style={{ marginBottom: 24 }}>
          <List
            dataSource={audio}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="view" onClick={() => navigate(`/audio/${item.id}`)}>
                    查看
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<SoundOutlined />} style={{ background: '#eb2f96' }} />}
                  title={item.title}
                  description={
                    <div>
                      <Tag color="magenta">¥{item.price}</Tag>
                      <Tag>{item.episodeCount}集</Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="我的电子书">
          <List
            dataSource={ebooks}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="view" onClick={() => navigate(`/ebooks/${item.id}`)}>
                    查看
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<ReadOutlined />} style={{ background: '#13c2c2' }} />}
                  title={item.title}
                  description={
                    <div>
                      <Tag color="cyan">¥{item.price}</Tag>
                      <Tag>{item.fileType}</Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Spin>

      <Modal
        title="发布专栏"
        open={columnModalVisible}
        onOk={handleCreateColumn}
        onCancel={() => setColumnModalVisible(false)}
        confirmLoading={submitting}
        width={600}
      >
        <Form form={columnForm} layout="vertical">
          <Form.Item name="title" label="专栏标题" rules={[{ required: true }]}>
            <Input placeholder="请输入专栏标题" />
          </Form.Item>
          <Form.Item name="description" label="专栏简介" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请输入专栏简介" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="编程开发">编程开发</Select.Option>
              <Select.Option value="设计创意">设计创意</Select.Option>
              <Select.Option value="商业管理">商业管理</Select.Option>
              <Select.Option value="语言学习">语言学习</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="monthlyPrice" label="月付价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入月付价格" />
          </Form.Item>
          <Form.Item name="quarterlyPrice" label="季付价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入季付价格" />
          </Form.Item>
          <Form.Item name="yearlyPrice" label="年付价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入年付价格" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="发布音频课程"
        open={audioModalVisible}
        onOk={handleCreateAudio}
        onCancel={() => setAudioModalVisible(false)}
        confirmLoading={submitting}
        width={600}
      >
        <Form form={audioForm} layout="vertical">
          <Form.Item name="title" label="课程标题" rules={[{ required: true }]}>
            <Input placeholder="请输入课程标题" />
          </Form.Item>
          <Form.Item name="description" label="课程简介" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请输入课程简介" />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入价格" />
          </Form.Item>
          <Form.Item name="isSeries" label="是否为系列课" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={true}>是（多集系列）</Select.Option>
              <Select.Option value={false}>否（单集）</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="发布电子书"
        open={ebookModalVisible}
        onOk={handleCreateEbook}
        onCancel={() => setEbookModalVisible(false)}
        confirmLoading={submitting}
        width={600}
      >
        <Form form={ebookForm} layout="vertical">
          <Form.Item name="title" label="书名" rules={[{ required: true }]}>
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item name="description" label="简介" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请输入书籍简介" />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="请输入价格" />
          </Form.Item>
          <Form.Item name="fileType" label="文件格式" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="PDF">PDF</Select.Option>
              <Select.Option value="EPUB">EPUB</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CreatorDashboard
