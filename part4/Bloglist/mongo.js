const mongoose = require('mongoose')

const url = 'mongodb+srv://Hrushi18:Kanna18@bloglist.xtqhwzq.mongodb.net/blogs?retryWrites=true&w=majority&appName=Bloglist'

mongoose.set('strictQuery',false)

mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model('Blog', blogSchema);

const blog = new Blog({
  title: 'My First Blog',
  author: 'Hrushi',
  url: 'http://example.com',
  likes: 10,
});

blog.save().then(result => {
  console.log('blog saved!')
  mongoose.connection.close()
})