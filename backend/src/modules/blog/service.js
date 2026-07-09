const { BlogPost, NewsletterSubscription } = require('./model');
const { DEFAULT_PAGE, DEFAULT_LIMIT, SORT_FIELDS, SORT_ORDER } = require('./constants');

class BlogService {
  async createPost(postData) {
    try {
      const post = await BlogPost.create(postData);
      
      return {
        success: true,
        data: post,
        message: 'Blog post created successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Blog post with this slug already exists');
      }
      throw new Error(`Failed to create blog post: ${error.message}`);
    }
  }

  async getPostBySlug(slug) {
    try {
      const post = await BlogPost.findOne({ slug, isPublished: true })
        .populate('relatedPosts', 'title slug excerpt coverImage publishedAt')
        .lean();
      
      if (!post) {
        throw new Error('Blog post not found');
      }
      
      // Increment views
      post.views += 1;
      await BlogPost.findByIdAndUpdate(post._id, { views: post.views });
      
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      throw new Error(`Failed to get blog post: ${error.message}`);
    }
  }

  async getPostById(id) {
    try {
      const post = await BlogPost.findById(id)
        .populate('relatedPosts', 'title slug excerpt coverImage publishedAt')
        .lean();
      
      if (!post) {
        throw new Error('Blog post not found');
      }
      
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      throw new Error(`Failed to get blog post: ${error.message}`);
    }
  }

  async getAllPosts(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isPublished: true };
      
      if (filters.category) query.category = filters.category;
      if (filters.tag) query.tags = { $in: [filters.tag] };
      if (filters.author) query['author.name'] = { $regex: filters.author, $options: 'i' };
      
      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.publishedAt;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };
      
      const posts = await BlogPost.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v -metadata')
        .lean();
      
      const total = await BlogPost.countDocuments(query);
      
      return {
        success: true,
        data: {
          data: posts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get blog posts: ${error.message}`);
    }
  }

  async searchPosts(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      
      const query = {
        isPublished: true,
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { excerpt: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
        ],
      };
      
      const posts = await BlogPost.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await BlogPost.countDocuments(query);
      
      return {
        success: true,
        data: {
          data: posts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search blog posts: ${error.message}`);
    }
  }

  async getRelatedPosts(postId, category, limit = 3) {
    try {
      const posts = await BlogPost.find({
        _id: { $ne: postId },
        category,
        isPublished: true,
      })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select('title slug excerpt coverImage publishedAt')
        .lean();
      
      return {
        success: true,
        data: posts,
      };
    } catch (error) {
      throw new Error(`Failed to get related posts: ${error.message}`);
    }
  }

  async updatePost(id, updates) {
    try {
      const post = await BlogPost.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!post) {
        throw new Error('Blog post not found');
      }
      
      return {
        success: true,
        data: post,
        message: 'Blog post updated successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Blog post with this slug already exists');
      }
      throw new Error(`Failed to update blog post: ${error.message}`);
    }
  }

  async deletePost(id) {
    try {
      const post = await BlogPost.findByIdAndDelete(id);
      
      if (!post) {
        throw new Error('Blog post not found');
      }
      
      return {
        success: true,
        message: 'Blog post deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete blog post: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const categories = await BlogPost.distinct('category', { isPublished: true });
      
      const categoryCounts = await BlogPost.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
      
      return {
        success: true,
        data: categories.map(cat => ({
          name: cat,
          count: categoryCounts.find(c => c._id === cat)?.count || 0,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async getTags() {
    try {
      const tags = await BlogPost.aggregate([
        { $match: { isPublished: true } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);
      
      return {
        success: true,
        data: tags,
      };
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }
  }

  async subscribeToNewsletter(email, source = 'website') {
    try {
      let subscription = await NewsletterSubscription.findOne({ email });
      
      if (subscription) {
        if (!subscription.isActive) {
          subscription.isActive = true;
          subscription.unsubscribedAt = null;
          await subscription.save();
        }
        
        return {
          success: true,
          message: 'You are already subscribed to our newsletter',
          data: subscription,
        };
      }
      
      subscription = await NewsletterSubscription.create({
        email,
        source,
      });
      
      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: subscription,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email is already subscribed');
      }
      throw new Error(`Failed to subscribe: ${error.message}`);
    }
  }

  async unsubscribeFromNewsletter(email) {
    try {
      const subscription = await NewsletterSubscription.findOne({ email });
      
      if (!subscription) {
        throw new Error('Email not found in our newsletter');
      }
      
      subscription.isActive = false;
      subscription.unsubscribedAt = new Date();
      await subscription.save();
      
      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      };
    } catch (error) {
      throw new Error(`Failed to unsubscribe: ${error.message}`);
    }
  }

  async getBlogStatistics() {
    try {
      const totalPosts = await BlogPost.countDocuments({ isPublished: true });
      const totalViews = await BlogPost.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]);
      
      const postsByCategory = await BlogPost.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
      
      const popularPosts = await BlogPost.find({ isPublished: true })
        .sort({ views: -1 })
        .limit(5)
        .select('title slug views publishedAt');
      
      return {
        success: true,
        data: {
          totalPosts,
          totalViews: totalViews[0]?.total || 0,
          postsByCategory: postsByCategory.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          popularPosts: popularPosts.map(p => ({
            title: p.title,
            slug: p.slug,
            views: p.views,
          })),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get blog statistics: ${error.message}`);
    }
  }
}

module.exports = new BlogService();