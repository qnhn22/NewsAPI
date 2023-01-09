const express = require('express')
const app = express()
const port = 3000
const path = require("path")
const mongoose = require('mongoose');
const Article = require("./models/article")
var cors = require('cors')

mongoose.connect('mongodb://localhost:27017/articleStore', {
    useNewUrlParser: true, useUnifiedTopology: true
})
    .then(() => {
        console.log("Mongo Connection Open!!!")
    }).catch(err => {
        console.log("Mongo error!!!")
        console.log(err)
    })

app.use(cors())

app.get("/", (req, res) => {
    res.send()
})


app.get("/articles", async (req, res) => {
    const { category } = req.query
    let articles
    if (category) {
        articles = await Article.find({ category: category })
    } else {
        articles = await Article.find({})
    }
    res.send({
        size: articles.length,
        data: articles
    })
})

app.get('/articles/:page', (req, res) => {
    let perPage = 10;
    let page = req.params.page || 1;
    const { category } = req.query
    let articles
    if (category) {
        articles = Article.find({ category: category })

    } else {
        articles = Article.find({})
    }
    articles
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec((err, articles) => {
            Article.countDocuments((err, count) => {
                if (err) return next(err);
                res.send({
                    page: page,
                    size: articles.length,
                    data: articles
                })
            });
        });
});

app.get("/articles/article/:id", async (req, res) => {
    const { id } = req.params
    const article = await Article.findById(id)
    res.json(article)
    console.log(article)
})

app.use((err, req, res, next) => {
    res.send(err)
    next()
})

app.use((req, res) => {
    res.status(404).send("Not found!")
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})