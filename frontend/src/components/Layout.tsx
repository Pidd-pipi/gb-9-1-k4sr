import { Outlet, useNavigate, Link } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Input, Badge } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  SoundOutlined,
  ReadOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  GiftOutlined,
  FileTextOutlined,
  TrophyOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/slices/authSlice'
import type { MenuProps } from 'antd'
import { useState } from 'react'

const { Header, Content, Sider } = AntLayout

function Layout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [searchValue, setSearchValue] = useState('')

  const handleLogout = () => {
    dispatch(logout() as any)
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <FileTextOutlined />,
      label: <Link to="/my/orders">我的订单</Link>,
    },
    {
      key: '2',
      icon: <BookOutlined />,
      label: <Link to="/my/subscriptions">我的订阅</Link>,
    },
    {
      key: '3',
      icon: <TrophyOutlined />,
      label: <Link to="/my/points">我的积分</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: '4',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const creatorMenuItems = user?.role === 'CREATOR'
    ? [
        {
          key: 'creator',
          icon: <UserOutlined />,
          label: <Link to="/creator/dashboard">创作者中心</Link>,
        },
      ]
    : [
        {
          key: 'apply',
          icon: <UserOutlined />,
          label: <Link to="/creator/apply">申请成为创作者</Link>,
        },
      ]

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/columns', icon: <BookOutlined />, label: <Link to="/columns">专栏</Link> },
    { key: '/audio', icon: <SoundOutlined />, label: <Link to="/audio">音频课程</Link> },
    { key: '/ebooks', icon: <ReadOutlined />, label: <Link to="/ebooks">电子书</Link> },
    { key: '/points-mall', icon: <GiftOutlined />, label: <Link to="/points-mall">积分商城</Link> },
    ...creatorMenuItems,
  ]

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1890ff',
            marginRight: '48px',
          }}
        >
          <Link to="/">知识付费平台</Link>
        </div>
        <div style={{ flex: 1, maxWidth: '400px', marginRight: '24px' }}>
          <Input.Search
            placeholder="搜索专栏、音频、电子书..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            enterButton
          />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/checkin">
                <Badge dot>
                  <Button type="text" icon={<TrophyOutlined />}>
                    每日签到
                  </Button>
                </Badge>
              </Link>
              <Dropdown menu={{ items: userMenuItems }}>
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Avatar icon={<UserOutlined />} src={user.avatar} />
                  <span style={{ marginLeft: '8px' }}>{user.username}</span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button type="text">登录</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">注册</Button>
              </Link>
            </>
          )}
        </div>
      </Header>
      <AntLayout>
        <Sider
          width={200}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          <Menu
            mode="inline"
            selectedKeys={[window.location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Content style={{ margin: 0, minHeight: 280, background: '#f5f5f5' }}>
          <div className="page-container">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
