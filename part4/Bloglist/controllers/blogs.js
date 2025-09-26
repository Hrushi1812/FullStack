const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params
  await Blog.findByIdAndDelete(id)
  response.status(204).end() 
})

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const body = request.body

  // Build updated blog object
  const updatedBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const savedBlog = await Blog.findByIdAndUpdate(id, updatedBlog, {
    new: true,           
    runValidators: true, 
    context: 'query',
  })

  if (savedBlog) {
    response.json(savedBlog)
  } else {
    response.status(404).end()
  }
})


module.exports = blogsRouter