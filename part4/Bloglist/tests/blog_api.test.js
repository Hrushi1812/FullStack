const { test, beforeEach, after } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  { title: 'First blog', author: 'Alice', url: 'http://example.com/1', likes: 1 },
  { title: 'Second blog', author: 'Bob', url: 'http://example.com/2', likes: 2 },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
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
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const blogs = response.body

  assert.strictEqual(blogs.length, initialBlogs.length + 1)

  const titles = blogs.map(b => b.title)
  assert.ok(titles.includes('New blog post'))
})

after(async () => {
  await mongoose.connection.close()
})
