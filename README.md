# 知识付费学习平台

一个面向内容创作者和终身学习者的知识付费学习平台，支持专栏订阅、音频课程、电子书阅读，并整合积分商城体系形成学习激励闭环。

## 快速启动（Docker Compose）

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 一键启动全部服务
docker compose up -d
```

等待服务启动完成后，访问以下地址：

- **前端页面**: http://localhost:8015
- **后端 API**: http://localhost:3015
- **MongoDB**: localhost:2804
- **Redis**: localhost:6415
- **MinIO 控制台**: http://localhost:9014

## 本地开发

### 环境要求

- Node.js 20+
- Java 17+
- Maven 3.9+
- MongoDB 6.0+
- Redis 7+
- MinIO（对象存储）

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run start
```

### 后端开发

```bash
cd backend

# 构建项目
mvn clean package -DskipTests

# 运行项目
mvn spring-boot:run
```

后端服务启动后，API 地址为 http://localhost:8080/api

## 项目主要功能

### 1. 创作者入驻
- 创作者注册后提交个人资料和领域专长
- 管理员审核通过后获得内容发布权限
- 创作者可自定义个人主页（头像、简介、擅长领域标签、社交链接）

### 2. 专栏订阅
- 创作者发布付费专栏
- 专栏包含多篇文章按时间顺序更新
- 用户按专栏订阅（支持月付、季付、年付）
- 已订阅用户可查看专栏全部历史文章

### 3. 音频课程
- 创作者上传音频课程（支持单集和多集系列）
- 每集音频包含标题、简介和时长信息
- 在线播放支持：
  - 进度条拖拽
  - 倍速播放（0.75x/1.0x/1.5x/2.0x）
  - 定时关闭
  - 后台播放（页面切换不中断）

### 4. 电子书阅读
- 创作者上传电子书（PDF/EPUB 格式）
- 在线阅读器支持：
  - 翻页
  - 字体大小调节
  - 夜间模式
  - 书签标记
  - 阅读进度记忆
- 电子书支持试读（前 10% 免费）后付费购买

### 5. 支付与订单
- 支持支付宝沙箱环境支付
- 订单管理支持查看历史购买记录
- 支持发票申请

### 6. 积分商城
- 用户通过学习行为获取积分：
  - 每日签到（+5 分）
  - 完成课程学习（+10 分）
  - 发表优质评论（+20 分）
- 积分可在商城兑换：
  - 优惠券（如 100 积分兑换 10 元优惠券）
  - 免费课程

### 7. 内容推荐与搜索
- 首页推荐热门专栏、新品课程和编辑精选
- 支持按关键词全局搜索内容（专栏文章、音频、电子书）
- 搜索结果按相关度和热度排序

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js + React | 14.x / 18.x |
| 前端构建 | Vite | 5.x |
| UI 组件 | Ant Design | 5.x |
| 状态管理 | Redux Toolkit | 2.x |
| 路由 | React Router | 6.x |
| 后端框架 | Spring Boot | 3.2.x |
| 开发语言 | Java | 17 |
| 数据库 | MongoDB | 6.0 |
| 缓存 | Redis | 7.x |
| 对象存储 | MinIO | latest |
| 认证 | JWT | 0.12.x |
| 容器化 | Docker + Docker Compose | - |
| 反向代理 | Nginx | Alpine |

## 项目目录结构

```
.
├── frontend/                    # 前端项目
│   ├── Dockerfile              # 前端 Docker 镜像
│   ├── nginx.conf              # Nginx 配置
│   ├── package.json            # 项目依赖
│   ├── tsconfig.json           # TypeScript 配置
│   ├── vite.config.ts          # Vite 配置
│   ├── index.html              # HTML 入口
│   └── src/                    # 源代码
│       ├── main.tsx            # 应用入口
│       ├── App.tsx             # 应用根组件
│       ├── api/                # API 请求
│       │   ├── axios.ts        # Axios 实例
│       │   ├── auth.ts         # 认证相关 API
│       │   ├── column.ts       # 专栏相关 API
│       │   ├── audio.ts        # 音频相关 API
│       │   ├── ebook.ts        # 电子书相关 API
│       │   ├── order.ts        # 订单相关 API
│       │   ├── points.ts       # 积分相关 API
│       │   ├── search.ts       # 搜索 API
│       │   └── creator.ts      # 创作者 API
│       ├── components/         # 公共组件
│       │   └── Layout.tsx      # 布局组件
│       ├── pages/              # 页面组件
│       │   ├── Home.tsx        # 首页
│       │   ├── Login.tsx       # 登录页
│       │   ├── Register.tsx    # 注册页
│       │   ├── ColumnList.tsx  # 专栏列表
│       │   ├── ColumnDetail.tsx # 专栏详情
│       │   ├── AudioCourseList.tsx # 音频列表
│       │   ├── AudioCourseDetail.tsx # 音频详情
│       │   ├── AudioPlayer.tsx # 音频播放器
│       │   ├── EbookList.tsx   # 电子书列表
│       │   ├── EbookDetail.tsx # 电子书详情
│       │   ├── EbookReader.tsx # 电子书阅读器
│       │   ├── PointsMall.tsx  # 积分商城
│       │   ├── MyOrders.tsx    # 我的订单
│       │   ├── MySubscriptions.tsx # 我的订阅
│       │   ├── MyPoints.tsx    # 我的积分
│       │   ├── CreatorProfile.tsx # 创作者主页
│       │   ├── CreatorApply.tsx # 申请创作者
│       │   ├── CreatorDashboard.tsx # 创作者中心
│       │   ├── Search.tsx      # 搜索页面
│       │   └── Checkin.tsx     # 签到页面
│       ├── store/              # Redux 状态管理
│       │   ├── index.ts        # Store 配置
│       │   └── slices/         # Redux Slices
│       ├── types/              # TypeScript 类型定义
│       └── styles/             # 全局样式
├── backend/                     # 后端项目
│   ├── Dockerfile              # 后端 Docker 镜像
│   ├── pom.xml                 # Maven 配置
│   └── src/main/               # 源代码
│       ├── resources/
│       │   └── application.yml # 应用配置
│       └── java/com/knowledge/platform/
│           ├── PlatformApplication.java # 应用入口
│           ├── config/         # 配置类
│           │   ├── PasswordEncoderConfig.java
│           │   ├── RedisConfig.java
│           │   ├── MinioConfig.java
│           │   ├── SecurityConfig.java
│           │   └── WebConfig.java
│           ├── security/       # 安全相关
│           │   ├── JwtTokenProvider.java
│           │   ├── JwtAuthenticationFilter.java
│           │   └── CurrentUserUtil.java
│           ├── entity/         # 实体类
│           │   ├── User.java
│           │   ├── Creator.java
│           │   ├── Column.java
│           │   ├── Article.java
│           │   ├── AudioCourse.java
│           │   ├── AudioEpisode.java
│           │   ├── Ebook.java
│           │   ├── Order.java
│           │   ├── Subscription.java
│           │   ├── PointsAccount.java
│           │   ├── PointsRecord.java
│           │   ├── Coupon.java
│           │   ├── Checkin.java
│           │   └── ReadingProgress.java
│           ├── repository/     # Repository 层
│           ├── service/        # Service 层
│           │   ├── AuthService.java
│           │   ├── CreatorService.java
│           │   ├── ColumnService.java
│           │   ├── SubscriptionService.java
│           │   ├── ArticleService.java
│           │   ├── AudioService.java
│           │   ├── AudioEpisodeService.java
│           │   ├── EbookService.java
│           │   ├── PointsService.java
│           │   ├── CheckinService.java
│           │   └── SearchService.java
│           ├── controller/     # Controller 层
│           │   ├── AuthController.java
│           │   ├── CreatorController.java
│           │   ├── ColumnController.java
│           │   ├── AudioController.java
│           │   ├── EbookController.java
│           │   ├── PointsController.java
│           │   ├── SearchController.java
│           │   └── MyController.java
│           └── dto/            # 数据传输对象
│               ├── ApiResponse.java
│               ├── LoginRequest.java
│               ├── LoginResponse.java
│               ├── RegisterRequest.java
│               ├── CreatorApplyRequest.java
│               ├── ColumnCreateRequest.java
│               └── SubscribeRequest.java
├── database/                    # 数据库脚本
│   └── init.js                 # MongoDB 初始化脚本
├── docker-compose.yml          # Docker Compose 编排
├── .env.example                # 环境变量示例
└── README.md                   # 项目说明文档
```

## 环境变量说明

复制 `.env.example` 为 `.env` 并根据需要修改：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `MONGO_DB_NAME` | `knowledge_platform` | MongoDB 数据库名 |
| `MONGO_ROOT_USER` | `admin` | MongoDB 管理员用户名 |
| `MONGO_ROOT_PASSWORD` | `admin123` | MongoDB 管理员密码 |
| `REDIS_PASSWORD` | `redis123` | Redis 密码 |
| `MINIO_ROOT_USER` | `minioadmin` | MinIO 管理员用户名 |
| `MINIO_ROOT_PASSWORD` | `minioadmin` | MinIO 管理员密码 |
| `JWT_SECRET` | `your_super_secret_jwt_key...` | JWT 签名密钥（生产环境必须修改） |
| `JWT_EXPIRATION` | `86400000` | JWT 过期时间（毫秒），默认 24 小时 |
| `ALIPAY_APP_ID` | - | 支付宝应用 ID（沙箱环境） |
| `ALIPAY_PRIVATE_KEY` | - | 支付宝私钥 |
| `ALIPAY_PUBLIC_KEY` | - | 支付宝公钥 |
| `ALIPAY_GATEWAY` | `https://openapi-sandbox.dl.alipaydev.com/gateway.do` | 支付宝网关 |

## Docker 部署说明

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| 前端 | 80 | 8015 | 前端 Nginx 服务 |
| 后端 | 8080 | 3015 | 后端 Spring Boot 服务 |
| MongoDB | 27017 | 2804 | 数据库服务 |
| Redis | 6379 | 6415 | 缓存服务 |
| MinIO API | 9000 | 9013 | 对象存储 API |
| MinIO Console | 9001 | 9014 | 对象存储控制台 |

### 数据卷

- `mongodb-data`: MongoDB 数据持久化
- `redis-data`: Redis 数据持久化
- `minio-data`: MinIO 对象存储数据持久化

### 常用命令

```bash
# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 停止并删除数据卷
docker compose down -v

# 重建并启动
docker compose up -d --build

# 查看服务状态
docker compose ps
```

### 常见问题

**1. 端口冲突**

如果主机端口被占用，请修改 `docker-compose.yml` 中的端口映射，或将占用端口的服务停止。

**2. 服务启动顺序**

后端服务依赖 MongoDB、Redis 和 MinIO 的健康检查通过后才会启动，首次启动可能需要等待 30-60 秒。

**3. JWT 密钥**

生产环境必须修改 `JWT_SECRET`，使用足够长且复杂的随机字符串，建议至少 32 个字符。

**4. MongoDB 连接**

Docker Compose 内部使用服务名通信，前端通过 Nginx 反向代理访问后端 API。

**5. MinIO 初始化**

首次启动后，需要登录 MinIO 控制台（http://localhost:9014）创建 `knowledge-platform` bucket。

## License

MIT License
