const { Category } = require('./model');
const {
  CategoryDTO,
  CategorySummaryDTO,
  CategoryTreeDTO,
} = require('./dto');
const {
  CATEGORY_STATUS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  SORT_FIELDS,
  SORT_ORDER,
} = require('./constants');

class CategoriesService {
  _generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  _addAuditLog(category, action, performedBy, details = null) {
    category.auditLog.push({
      action,
      performedBy,
      timestamp: new Date(),
      details,
    });
  }

  async _calculatePath(category) {
    if (!category.parentCategory) {
      return `/${category._id}`;
    }

    const parent = await Category.findById(category.parentCategory);
    if (parent) {
      return `${parent.path}/${category._id}`;
    }

    return `/${category._id}`;
  }

  async createCategory(createdBy, categoryData) {
    try {
      const slug = categoryData.slug || this._generateSlug(categoryData.name);
      
      const category = await Category.create({
        ...categoryData,
        slug,
        createdBy,
        level: categoryData.parentCategory ? 1 : 0,
      });

      const path = await this._calculatePath(category);
      category.path = path;
      await category.save();

      this._addAuditLog(category, 'CATEGORY_CREATED', createdBy, 'Category created');

      return {
        success: true,
        data: new CategoryDTO(category),
        message: 'Category created successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Category with this slug already exists');
      }
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId)
        .populate('parentCategory', 'name slug')
        .lean();

      if (!category || category.isDeleted) {
        throw new Error('Category not found');
      }

      return {
        success: true,
        data: new CategoryDTO(category),
      };
    } catch (error) {
      throw new Error(`Failed to get category: ${error.message}`);
    }
  }

  async updateCategory(categoryId, userId, updates) {
    try {
      const category = await Category.findById(categoryId);

      if (!category || category.isDeleted) {
        throw new Error('Category not found');
      }

      if (updates.name && !updates.slug) {
        updates.slug = this._generateSlug(updates.name);
      }

      if (updates.parentCategory) {
        if (updates.parentCategory === categoryId) {
          throw new Error('Category cannot be its own parent');
        }

        const parent = await Category.findById(updates.parentCategory);
        if (!parent || parent.isDeleted) {
          throw new Error('Invalid parent category');
        }

        updates.level = parent.level + 1;
      }

      updates.updatedBy = userId;

      Object.assign(category, updates);
      this._addAuditLog(category, 'CATEGORY_UPDATED', userId, 'Category updated');

      await category.save();

      return {
        success: true,
        data: new CategoryDTO(category),
        message: 'Category updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async deleteCategory(categoryId, deletedBy) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new Error('Category not found');
      }

      if (category.isDeleted) {
        throw new Error('Category is already deleted');
      }

      const childCount = await Category.countDocuments({
        parentCategory: categoryId,
        isDeleted: false,
      });

      if (childCount > 0) {
        throw new Error('Cannot delete category with child categories');
      }

      category.isDeleted = true;
      category.deletedAt = new Date();
      category.deletedBy = deletedBy;
      this._addAuditLog(category, 'CATEGORY_DELETED', deletedBy, 'Category soft deleted');

      await category.save();

      return {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  async restoreCategory(categoryId, userId) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new Error('Category not found');
      }

      if (!category.isDeleted) {
        throw new Error('Category is not deleted');
      }

      if (category.parentCategory) {
        const parent = await Category.findById(category.parentCategory);
        if (!parent || parent.isDeleted) {
          throw new Error('Parent category is still deleted');
        }
      }

      category.isDeleted = false;
      category.deletedAt = null;
      category.deletedBy = null;
      this._addAuditLog(category, 'CATEGORY_RESTORED', userId, 'Category restored');

      await category.save();

      return {
        success: true,
        data: new CategoryDTO(category),
        message: 'Category restored successfully',
      };
    } catch (error) {
      throw new Error(`Failed to restore category: ${error.message}`);
    }
  }

  async getAllCategories(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = { isDeleted: false };

      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.parentCategory) query.parentCategory = filters.parentCategory;
      
      if (filters.isFeatured !== undefined) {
        query.isFeatured = filters.isFeatured === 'true' || filters.isFeatured === true;
      }

      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.order;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };

      const categories = await Category.find(query)
        .populate('parentCategory', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Category.countDocuments(query);

      return {
        success: true,
        data: {
          data: categories.map((c) => new CategorySummaryDTO(c)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async searchCategories(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const skip = (page - 1) * limit;
      const query = {
        isDeleted: false,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { slug: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      const results = await Category.find(query)
        .populate('parentCategory', 'name slug')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Category.countDocuments(query);

      return {
        success: true,
        data: {
          data: results.map((c) => new CategorySummaryDTO(c)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search categories: ${error.message}`);
    }
  }

  async getCategoryTree(status = CATEGORY_STATUS.ACTIVE) {
    try {
      const query = { isDeleted: false };
      if (status) query.status = status;

      const rootCategories = await Category.find({
        ...query,
        parentCategory: null,
      })
        .sort({ order: 1, name: 1 })
        .lean();

      const buildTree = async (parentId) => {
        const children = await Category.find({
          ...query,
          parentCategory: parentId,
        })
          .sort({ order: 1, name: 1 })
          .lean();

        for (const child of children) {
          child.children = await buildTree(child._id);
        }

        return children;
      };

      const tree = [];
      for (const root of rootCategories) {
        const rootWithChildren = { ...root };
        rootWithChildren.children = await buildTree(root._id);
        tree.push(rootWithChildren);
      }

      return {
        success: true,
        data: tree.map((c) => new CategoryTreeDTO(c)),
      };
    } catch (error) {
      throw new Error(`Failed to get category tree: ${error.message}`);
    }
  }

  async getFeaturedCategories() {
    try {
      const categories = await Category.find({
        isFeatured: true,
        status: CATEGORY_STATUS.ACTIVE,
        isDeleted: false,
      })
        .sort({ order: 1, name: 1 })
        .lean();

      return {
        success: true,
        data: categories.map((c) => new CategorySummaryDTO(c)),
      };
    } catch (error) {
      throw new Error(`Failed to get featured categories: ${error.message}`);
    }
  }

  async getCategoryStatistics() {
    try {
      const totalCategories = await Category.countDocuments({ isDeleted: false });
      const activeCategories = await Category.countDocuments({ 
        status: CATEGORY_STATUS.ACTIVE,
        isDeleted: false 
      });
      const inactiveCategories = await Category.countDocuments({ 
        status: CATEGORY_STATUS.INACTIVE,
        isDeleted: false 
      });
      const archivedCategories = await Category.countDocuments({ 
        status: CATEGORY_STATUS.ARCHIVED,
        isDeleted: false 
      });
      const deletedCategories = await Category.countDocuments({ isDeleted: true });

      const categoriesByType = await Category.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      const rootCategories = await Category.countDocuments({
        parentCategory: null,
        isDeleted: false,
      });

      const childCategories = await Category.countDocuments({
        parentCategory: { $ne: null },
        isDeleted: false,
      });

      return {
        success: true,
        data: {
          totalCategories,
          activeCategories,
          inactiveCategories,
          archivedCategories,
          deletedCategories,
          categoriesByType: categoriesByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          rootCategories,
          childCategories,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get category statistics: ${error.message}`);
    }
  }
}

module.exports = new CategoriesService();