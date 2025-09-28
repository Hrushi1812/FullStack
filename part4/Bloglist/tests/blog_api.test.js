const { test, beforeEach, after } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
  { title: 'First blog', author: 'Alice', url: 'http://example.com/1', likes: 1 },
  { title: 'Second blog', author: 'Bob', url: 'http://example.com/2', likes: 2 },
]

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)

  // ensure a fresh user and get a valid JWT for protected routes
  await User.deleteMany({})
  await supertest(app)
    .post('/api/users')
    .send({ username: 'testuser', name: 'Test User', password: 'secret' })
    .expect(201)

  const loginRes = await supertest(app)
    .post('/api/login')
    .send({ username: 'testuser', password: 'secret' })
    .expect(200)
  token = loginRes.body.token
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, 2)
})

test('unique identifier property of blogs is named id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  blogs.forEach(blog => {
    assert.ok(blog.id, 'blog.id is missing')
    assert.strictEqual(blog._id, undefined, 'blog._id should not be returned')
  })
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New blog post',
    author: 'Charlie',
    url: 'http://example.com/3',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const blogs = response.body

  assert.strictEqual(blogs.length, initialBlogs.length + 1)

  const titles = blogs.map(b => b.title)
  assert.ok(titles.includes('New blog post'))
})

test('if likes property is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Charlie',
    url: 'http://example.com/3'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Charlie',
    url: 'http://example.com/3',
    likes: 4,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await api.get('/api/blogs')
  assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'No URL blog',
    author: 'Charlie',
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await api.get('/api/blogs')
  assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length)
})

test('a blog can be deleted (only by its creator)', async () => {
  const start = await api.get('/api/blogs')

  // create a blog as the authenticated user
  const newBlog = {
    title: 'Deletable blog',
    author: 'Me',
    url: 'http://example.com/delete-me',
  }
  const created = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const afterCreate = await api.get('/api/blogs')
  assert.strictEqual(afterCreate.body.length, start.body.length + 1)

  // delete with the same user/token
  await api
    .delete(`/api/blogs/${created.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const afterDelete = await api.get('/api/blogs')
  assert.strictEqual(afterDelete.body.length, afterCreate.body.length - 1)
  const titles = afterDelete.body.map(b => b.title)
  assert.ok(!titles.includes('Deletable blog'))
})

test('a blog\'s likes can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 10 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

  const blogsAtEnd = await api.get('/api/blogs')
  const likesAtEnd = blogsAtEnd.body.find(b => b.id === blogToUpdate.id).likes
  assert.strictEqual(likesAtEnd, blogToUpdate.likes + 10)
})

after(async () => {
  await mongoose.connection.close()
})
