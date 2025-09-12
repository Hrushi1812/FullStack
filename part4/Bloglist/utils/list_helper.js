const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) =>
  blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((fav, blog) =>
    blog.likes > fav.likes ? blog : fav
  )
}

// const mostBlogs = (blogs) => {
//   if (blogs.length === 0) return null

//   // Create a frequency map { author: count }
//   const authorCount = blogs.reduce((acc, blog) => {
//     acc[blog.author] = (acc[blog.author] || 0) + 1
//     return acc
//   }, {})

//   // Find author with maximum blogs
//   let topAuthor = null
//   let maxBlogs = 0

//   for (const author in authorCount) {
//     if (authorCount[author] > maxBlogs) {
//       maxBlogs = authorCount[author]
//       topAuthor = author
//     }
//   }

//   return {
//     author: topAuthor,
//     blogs: maxBlogs
//   }
// }

const _ = require('lodash')

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  // Group blogs by author → { "Robert C. Martin": [blogs], ... }
  const grouped = _.groupBy(blogs, 'author')

  // Find the author with the max number of blogs
  const topAuthor = _.maxBy(Object.keys(grouped), (author) => grouped[author].length)

  return {
    author: topAuthor,
    blogs: grouped[topAuthor].length
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  // Group by author
  const grouped = _.groupBy(blogs, 'author')

  // Find the author with most total likes
  const topAuthor = _.maxBy(Object.keys(grouped), (author) => 
    _.sumBy(grouped[author], 'likes')
  )

  return {
    author: topAuthor,
    likes: _.sumBy(grouped[topAuthor], 'likes')
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}