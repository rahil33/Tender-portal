const { BlogPost, NewsletterSubscription } = require('./model');

class BlogResponseDTO {
  constructor(success, message, data = null, errors = []) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}

class BlogPostDTO {
  constructor(post) {
    this.id = post._id || post.id;
    this.title = post.title;
    this.slug = post.slug;
    this.excerpt = post.excerpt;
    this.content = post.content;
    this.coverImage = post.coverImage;
    this.category = post.category;
    this.tags = post.tags || [];
    this.author = post.author;
    this.publishedAt = post.publishedAt;
    this.isPublished = post.isPublished;
    this.views = post.views;
    this.readTime = post.readTime;
    this.seo = post.seo;
    this.relatedPosts = post.relatedPosts || [];
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
  }
}

class BlogPostSummaryDTO {
  constructor(post) {
    this.id = post._id || post.id;
    this.title = post.title;
    this.slug = post.slug;
    this.excerpt = post.excerpt;
    this.coverImage = post.coverImage;
    this.category = post.category;
    this.tags = post.tags || [];
    this.author = post.author;
    this.publishedAt = post.publishedAt;
    this.views = post.views;
    this.readTime = post.readTime;
  }
}

class NewsletterSubscriptionDTO {
  constructor(subscription) {
    this.id = subscription._id || subscription.id;
    this.email = subscription.email;
    this.subscribedAt = subscription.subscribedAt;
    this.isActive = subscription.isActive;
    this.source = subscription.source;
  }
}

module.exports = {
  BlogResponseDTO,
  BlogPostDTO,
  BlogPostSummaryDTO,
  NewsletterSubscriptionDTO,
};