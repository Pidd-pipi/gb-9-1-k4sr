import { useEffect, useState } from 'react'
import { Table, Typography, Tag, Button, Space, Modal, Form, Input, Select, message, Spin } from 'antd'
import { orderApi } from '../api/order'
import type { Order } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography

function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await orderApi.list()
      setOrders(res.data?.data?.content || res.data || [])
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestInvoice = async () => {
    if (!selectedOrder) return
    setInvoiceLoading(true)
    try {
      const values = await form.validateFields()
      await orderApi.requestInvoice(selectedOrder.id, values)
      message.success('发票申请已提交')
      setInvoiceModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Invoice request failed:', error)
    } finally {
      setInvoiceLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'orange',
      PAID: 'green',
      CANCELLED: 'red',
      REFUNDED: 'default',
    }
    const labels: Record<string, string> = {
      PENDING: '待支付',
      PAID: '已支付',
      CANCELLED: '已取消',
      REFUNDED: '已退款',
    }
    return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
  }

  const getTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      COLUMN_SUBSCRIPTION: 'purple',
      AUDIO_PURCHASE: 'magenta',
      EBOOK_PURCHASE: 'cyan',
    }
    const labels: Record<string, string> = {
      COLUMN_SUBSCRIPTION: '专栏订阅',
      AUDIO_PURCHASE: '音频购买',
      EBOOK_PURCHASE: '电子书购买',
    }
    return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '商品',
      dataIndex: 'itemTitle',
      key: 'itemTitle',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <span style={{ fontWeight: 600 }}>¥{amount}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button type="primary" size="small">
              去支付
            </Button>
          )}
          {record.status === 'PAID' && (
            <Button
              size="small"
              onClick={() => {
                setSelectedOrder(record)
                setInvoiceModalVisible(true)
              }}
            >
              申请发票
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>我的订单</Title>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title="申请发票"
        open={invoiceModalVisible}
        onOk={handleRequestInvoice}
        onCancel={() => setInvoiceModalVisible(false)}
        confirmLoading={invoiceLoading}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="发票类型"
            rules={[{ required: true, message: '请选择发票类型' }]}
          >
            <Select>
              <Select.Option value="PERSONAL">个人发票</Select.Option>
              <Select.Option value="COMPANY">企业发票</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="发票抬头"
            rules={[{ required: true, message: '请输入发票抬头' }]}
          >
            <Input placeholder="请输入发票抬头" />
          </Form.Item>
          <Form.Item name="taxNo" label="税号">
            <Input placeholder="请输入税号（企业发票必填）" />
          </Form.Item>
          <Form.Item name="email" label="接收邮箱">
            <Input placeholder="请输入接收邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyOrders
