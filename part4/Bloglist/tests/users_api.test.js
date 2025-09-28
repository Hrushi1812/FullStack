const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

beforeEach(async () => {
  await User.deleteMany({})
  await new User({ username: 'root', passwordHash: 'hashed' }).save()
})

describe('user creation validations', () => {
  test('succeeds with a fresh username and valid password', async () => {
    const start = await usersInDb()

    const newUser = { username: 'alice', name: 'Alice', password: 'secret' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // passwordHash removed by toJSON
    assert.ok(result.body.id)
    assert.strictEqual(result.body.username, 'alice')
    assert.strictEqual(result.body.passwordHash, undefined)

    const end = await usersInDb()
    assert.strictEqual(end.length, start.length + 1)
    const usernames = end.map(u => u.username)
    assert.ok(usernames.includes('alice'))
  })

  test('fails with 400 if username is missing', async () => {
    const start = await usersInDb()
    const newUser = { name: 'NoUser', password: 'secret' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /username and password required/)
    const end = await usersInDb()
    assert.strictEqual(end.length, start.length)
  })

  test('fails with 400 if password is missing', async () => {
    const start = await usersInDb()
    const newUser = { username: 'nouserpwd', name: 'NoPwd' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /username and password required/)
    const end = await usersInDb()
    assert.strictEqual(end.length, start.length)
  })

  test('fails with 400 if username is too short', async () => {
    const start = await usersInDb()
    const newUser = { username: 'ab', password: 'secret' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /username must be at least 3 characters long/)
    const end = await usersInDb()
    assert.strictEqual(end.length, start.length)
  })

  test('fails with 400 if password is too short', async () => {
    const start = await usersInDb()
    const newUser = { username: 'newuser', password: '12' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /password must be at least 3 characters long/)
    const end = await usersInDb()
    assert.strictEqual(end.length, start.length)
  })

  test('fails with 400 if username already exists', async () => {
    const start = await usersInDb()
    const newUser = { username: 'root', password: 'secret123' }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    assert.match(result.body.error, /username must be unique/)
    const end = await usersInDb()
    assert.strictEqual(end.length, start.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
