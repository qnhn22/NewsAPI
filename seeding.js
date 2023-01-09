const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Article = require("./models/article")

mongoose.connect('mongodb://localhost:27017/articleStore', {
    useNewUrlParser: true, useUnifiedTopology: true,
})
    .then(() => {
        console.log("Mongo Connection Open!!!")
    }).catch(err => {
        console.log("Mongo error!!!")
        console.log(err)
    })

let fixedArticles = []
const categories = ["business", "technology", "politics", "education", "health", "science"]

function crawledDate() {
    let currentdate = new Date()
    return currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds()
}

async function scrapeNY(arr) {
    for (let c of categories) {
        let url = `https://www.nytimes.com/section/${c}`;
        let rawData = await axios.get(url);
        let articleData = rawData.data
        let $ = cheerio.load(articleData);
        let listItems = $(".css-13mho3u ol li");
        listItems.each((idx, el) => {
            let article = {
                source: "NY Times",
                category: c,
                author: "",
                title: "",
                link: "",
                img: "",
                date: crawledDate(),
                excerpt: ""
            };

            article.title = $(el).find("h2").text()
            article.link = $(el).find("a").attr("href")
            article.img = $(el).find("img").attr("src")
            article.author = $(el).find("span").text()
            article.excerpt = $(el).find("a > p").text()

            // Populate articles array
            if (article.img) {
                let exist = false
                for (let existingArticle of arr) {
                    if (article.title === existingArticle.title || article.link === existingArticle.link) {
                        exist = true
                    }
                }
                if (!exist) {
                    arr.push(article)
                }
            }
        })
    }
}

async function scrapeTA(arr) {
    for (let c of categories) {
        let url = `https://www.theatlantic.com/${c}`;
        let rawData = await axios.get(url);
        let articleData = rawData.data
        let $ = cheerio.load(articleData);
        let listItems = $("section ul li");
        listItems.each((idx, el) => {
            let article = {
                source: "The Atlantic",
                category: c,
                author: "",
                title: "",
                link: "",
                img: "",
                date: crawledDate(),
                excerpt: ""
            };

            article.title = $(el).find("article h2").text()
            article.link = $(el).find("article a").attr("href")
            article.img = $(el).find("img").attr("src")
            article.author = $(el).find(".LandingMetadata_author___tB8K").text()
            article.excerpt = $(el).find("article > p").text()

            // Populate news array with new data
            if (article.img) {
                let exist = false
                for (let existingArticle of arr) {
                    if (article.title === existingArticle.title || article.link === existingArticle.link) {
                        exist = true
                    }
                }
                if (!exist) {
                    arr.push(article)
                }
            }
        })
    }
}

async function scrapeData() {
    try {
        const articles = [];
        await scrapeNY(articles)
        await scrapeTA(articles)
        fixedArticles = articles
    } catch (err) {
        console.error(err);
    }
}

// cron job 
// cron.schedule("30 5 13 * * Sunday", scrapeData)

const saveData = async function () {
    try {
        await scrapeData()
        const res = await Article.insertMany(fixedArticles)
        console.log(res)
        fixedArticles = []
    } catch (err) {
        console.log(err)
    }
}

saveData()