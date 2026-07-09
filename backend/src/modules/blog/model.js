const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Blog post slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Blog post excerpt is required'],
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, 'Blog post content is required'],
      maxlength: 50000,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Blog post category is required'],
      enum: ['gem-portal', 'tender-tips', 'certificates', 'training', 'industry-news', 'case-studies', 'other'],
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    author: {
      name: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
      },
      role: {
        type: String,
        default: 'Admin',
        trim: true,
      },
      avatar: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 5,
      min: 1,
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 60 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      keywords: [{ type: String, trim: true, lowercase: true }],
    },
    relatedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

blogPostSchema.index({ category: 1, isPublished: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ views: -1 });

// Newsletter subscription schema
const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  unsubscribedAt: {
    type: Date,
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'blog', 'landing-page', 'other'],
  },
}, { timestamps: true });

newsletterSubscriptionSchema.index({ isActive: 1 });

module.exports = {
  BlogPost: mongoose.model('BlogPost', blogPostSchema),
  NewsletterSubscription: mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema),
};