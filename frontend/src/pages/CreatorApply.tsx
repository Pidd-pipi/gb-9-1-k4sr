import { useState } from 'react'
import { Card, Form, Input, Button, Typography, Select, message, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { creatorApi } from '../api/creator'

const { Title, Text } = Typography
const { TextArea } = Input

function CreatorApply() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const expertiseOptions = [
    { label: '编程开发', value: '编程开发' },
    { label: '设计创意', value: '设计创意' },
    { label: '商业管理', value: '商业管理' },
    { label: '投资理财', value: '投资理财' },
    { label: '语言学习', value: '语言学习' },
    { label: '职业发展', value: '职业发展' },
    { label: '健康生活', value: '健康生活' },
    { label: '人文社科', value: '人文社科' },
  ]

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await creatorApi.apply(values)
      message.success('申请已提交，请等待管理员审核')
      navigate('/')
    } catch (error) {
      message.error('申请提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
          申请成为创作者
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
          分享您的知识与经验，帮助更多人成长
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ expertise: [] }}
        >
          <Form.Item
            name="bio"
            label="个人简介"
            rules={[{ required: true, message: '请输入个人简介' }]}
          >
            <TextArea
              rows={4}
              placeholder="请介绍一下您自己、您的专业背景和擅长领域..."
            />
          </Form.Item>

          <Form.Item
            name="expertise"
            label="擅长领域"
            rules={[{ required: true, message: '请选择至少一个擅长领域' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择擅长领域"
              options={expertiseOptions}
            />
          </Form.Item>

          <Form.Item name="socialLinks" label="社交链接（可选）">
            <Input placeholder="个人网站、博客或社交媒体链接" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              提交申请
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CreatorApply
