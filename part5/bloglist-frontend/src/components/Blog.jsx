import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlog, removeBlog, user }) => {
  const [visible, setVisible] = useState(false)
  const toggleVisibility = () => setVisible(!visible)

  // Determine if the logged-in user is the creator of the blog
  const isOwner = (() => {
    if (!user || !blog?.user) return false
    // blog.user can be an object (populated) or a string (id)
    if (typeof blog.user === 'object') {
      const blogUserId = blog.user.id
      const blogUsername = blog.user.username
      // Prefer id comparison when both available, else fall back to username
      if (blogUserId && user.id) return blogUserId === user.id
      if (blogUsername && user.username) return blogUsername === user.username
      return false
    } else {
      // blog.user is an id string
      return user.id ? blog.user === user.id : false
    }
  })()

  const handleLike = async () => {
    const blogUserId = typeof blog.user === 'object' ? blog.user.id : blog.user
    const updatedBlog = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: blogUserId
    }
    const returnedBlog = await blogService.update(blog.id, updatedBlog)
    updateBlog(returnedBlog)
  }

  const handleRemove = async () => {
    if (!isOwner) return
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      await blogService.remove(blog.id)
      removeBlog(blog.id)
    }
  }

  return (
    <div style={{ padding: 10, border: 'solid', borderWidth: 1, marginBottom: 5 }}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleVisibility} style={{ marginLeft: '10px' }}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>

      {visible && (
        <div style={{ marginTop: 5 }}>
          <div><a href={blog.url} target="_blank" rel="noopener noreferrer">{blog.url}</a></div>
          <div>Likes: {blog.likes} <button onClick={handleLike}>like</button></div>
          <div>{blog.user?.name || 'Unknown'}</div>

          {isOwner && (
            <button onClick={handleRemove} style={{ marginTop: '5px', backgroundColor: 'red', color: 'white' }}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog