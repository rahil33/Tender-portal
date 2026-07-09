const { body, param, query } = require('express-validator');
const { validationMiddleware } = require('../../middleware/validationMiddleware');

const createPostValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('slug').trim().notEmpty().withMessage('Slug is required').isLength({ max: 200 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required').isLength({ max: 500 }),
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 50000 }),
  body('category').notEmpty().withMessage('Category is required')
    .isIn(['gem-portal', 'tender-tips', 'certificates', 'training', 'industry-news', 'case-studies', 'other']),
  body('tags').optional().isArray(),
  body('tags.*').trim(),
  body('author.name').trim().notEmpty().withMessage('Author name is required'),
  body('author.role').optional().trim(),
  body('author.avatar').optional().trim(),
  body('author.email').optional().trim().isEmail(),
  body('coverImage').optional().trim(),
  body('publishedAt').optional().isISO8601(),
  body('isPublished').optional().isBoolean(),
  body('views').optional().isInt({ min: 0 }),
  body('readTime').optional().isInt({ min: 1 }),
  body('seo.metaTitle').optional().trim().isLength({ max: 60 }),
  body('seo.metaDescription').optional().trim().isLength({ max: 160 }),
  body('seo.keywords').optional().isArray(),
  body('relatedPosts').optional().isArray(),
  validationMiddleware,
];

const updatePostValidator = [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('slug').optional().trim().isLength({ max: 200 }),
  body('excerpt').optional().trim().isLength({ max: 500 }),
  body('content').optional().trim().isLength({ max: 50000 }),
  body('category').optional().isIn(['gem-portal', 'tender-tips', 'certificates', 'training', 'industry-news', 'case-studies', 'other']),
  body('tags').optional().isArray(),
  body('tags.*').trim(),
  body('author.name').optional().trim(),
  body('author.role').optional().trim(),
  body('author.avatar').optional().trim(),
  body('author.email').optional().trim().isEmail(),
  body('coverImage').optional().trim(),
  body('publishedAt').optional().isISO8601(),
  body('isPublished').optional().isBoolean(),
  body('views').optional().isInt({ min: 0 }),
  body('readTime').optional().isInt({ min: 1 }),
  body('seo.metaTitle').optional().trim().isLength({ max: 60 }),
  body('seo.metaDescription').optional().trim().isLength({ max: 160 }),
  body('seo.keywords').optional().isArray(),
  body('relatedPosts').optional().isArray(),
  validationMiddleware,
];

const getPostBySlugValidator = [
  param('slug').trim().notEmpty().withMessage('Post slug is required'),
  validationMiddleware,
];

const getAllPostsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['gem-portal', 'tender-tips', 'certificates', 'training', 'industry-news', 'case-studies', 'other']),
  query('tag').optional().trim(),
  query('author').optional().trim(),
  query('sortBy').optional().isIn(['publishedAt', 'views', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  validationMiddleware,
];

const searchPostsValidator = [
  query('q').trim().notEmpty().withMessage('Search term is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validationMiddleware,
];

const newsletterSubscribeValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('source').optional().isIn(['website', 'blog', 'landing-page', 'other']),
  validationMiddleware,
];

const newsletterUnsubscribeValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  validationMiddleware,
];

module.exports = {
  createPostValidator,
  updatePostValidator,
  getPostBySlugValidator,
  getAllPostsValidator,
  searchPostsValidator,
  newsletterSubscribeValidator,
  newsletterUnsubscribeValidator,
};