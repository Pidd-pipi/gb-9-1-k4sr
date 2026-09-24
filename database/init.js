db = db.getSiblingDB('knowledge_platform');

db.createUser({
  user: 'app',
  pwd: 'app123',
  roles: [{
    role: 'readWrite',
    db: 'knowledge_platform'
  }]
});

db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.createCollection('creators');
db.creators.createIndex({ userId: 1 }, { unique: true });

db.createCollection('columns');
db.columns.createIndex({ creatorId: 1 });
db.columns.createIndex({ title: 'text', description: 'text' });

db.createCollection('articles');
db.articles.createIndex({ columnId: 1 });
db.articles.createIndex({ title: 'text', content: 'text' });

db.createCollection('audio_courses');
db.audio_courses.createIndex({ creatorId: 1 });
db.audio_courses.createIndex({ title: 'text', description: 'text' });

db.createCollection('audio_episodes');
db.audio_episodes.createIndex({ courseId: 1 });

db.createCollection('ebooks');
db.ebooks.createIndex({ creatorId: 1 });
db.ebooks.createIndex({ title: 'text', description: 'text' });

db.createCollection('orders');
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ orderNo: 1 }, { unique: true });

db.createCollection('subscriptions');
db.subscriptions.createIndex({ userId: 1 });
db.subscriptions.createIndex({ columnId: 1 });

db.createCollection('points');
db.points.createIndex({ userId: 1 }, { unique: true });

db.createCollection('points_records');
db.points_records.createIndex({ userId: 1 });

db.createCollection('coupons');
db.coupons.createIndex({ userId: 1 });

db.createCollection('comments');
db.comments.createIndex({ targetId: 1, targetType: 1 });
db.comments.createIndex({ userId: 1 });

db.createCollection('checkins');
db.checkins.createIndex({ userId: 1, date: 1 }, { unique: true });

db.createCollection('bookmarks');
db.bookmarks.createIndex({ userId: 1 });

db.createCollection('reading_progress');
db.reading_progress.createIndex({ userId: 1, ebookId: 1 }, { unique: true });

db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  password: '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH',
  role: 'ADMIN',
  avatar: '',
  createdAt: new Date(),
  updatedAt: new Date()
});
