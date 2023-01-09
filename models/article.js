const mongoose = require("mongoose")

const articleSchema = mongoose.Schema({
    source: String,
    category: String,
    title: String,
    link: String,
    excerpt: String,
    img: String,
    date: String,
    author: String
})

const Article = mongoose.model("Article", articleSchema)

module.exports = Article 