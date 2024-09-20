import { StatusCodes } from 'http-status-codes'
import { clearArticlesCache } from '~/utils/redisCache'
import redisClient from '~/config/redis.config'
import Article from '~/models/article.model'

const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const articles = await Article.find()
      .populate('author', 'username email')
      .limit(limit * 1)
      .skip(skip)
      .exec()

    const totalArticles = await Article.countDocuments()
    const totalPages = Math.ceil(totalArticles / limit)

    const response = { articles, totalPages, currentPage: page }

    const cacheKey = `articles:${page}:${limit}`
    redisClient.setex(cacheKey, 3600, JSON.stringify(response))

    res.status(StatusCodes.OK).json(response)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const createArticle = async (req, res) => {
  try {
    // Create a new article
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please provide title and content' })
    }
    const newArticle = new Article({ title, content, author: req.jwtDecoded.id })

    await newArticle.save()

    // Clear the cache
    redisClient.keys('articles:*', (err, keys) => {
      if (err) return console.error(err)
      keys.forEach(key => {
        redisClient.del(key)
      })
    })

    res.status(StatusCodes.CREATED).json(newArticle)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const updateArticle = async (req, res) => {
  try {
    const idArticle = req.params.id
    const { title, content } = req.body

    const updateArticle = await Article.findByIdAndUpdate(idArticle, { title, content }, { new: true })

    // Clear the cache
    clearArticlesCache()

    res.status(StatusCodes.OK).json(updateArticle)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}
const removeArticle = async (req, res) => {
  try {
    //
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

export const articleController = {
  getArticles,
  createArticle,
  updateArticle,
  removeArticle
}