const categoriesService = require('./service');
const { CategoriesResponseDTO } = require('./dto');

class CategoriesController {
  async createCategory(req, res) {
    try {
      const createdBy = req.user?.id || req.user?.userId;
      const result = await categoriesService.createCategory(createdBy, req.body);

      return res.status(201).json(
        new CategoriesResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new CategoriesResponseDTO(false, 'Failed to create category', null, [error.message])
      );
    }
  }

  async getCategoryById(req, res) {
    try {
      const { categoryId } = req.params;
      const result = await categoriesService.getCategoryById(categoryId);

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, 'Category retrieved', result.data)
      );
    } catch (error) {
      return res.status(404).json(
        new CategoriesResponseDTO(false, 'Failed to get category', null, [error.message])
      );
    }
  }

  async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await categoriesService.updateCategory(categoryId, userId, req.body);

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new CategoriesResponseDTO(false, 'Failed to update category', null, [error.message])
      );
    }
  }

  async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await categoriesService.deleteCategory(categoryId, userId);

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new CategoriesResponseDTO(false, 'Failed to delete category', null, [error.message])
      );
    }
  }

  async restoreCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const userId = req.user?.id || req.user?.userId;
      const result = await categoriesService.restoreCategory(categoryId, userId);

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      return res.status(400).json(
        new CategoriesResponseDTO(false, 'Failed to restore category', null, [error.message])
      );
    }
  }

  async getAllCategories(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        parentCategory,
        isFeatured,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await categoriesService.getAllCategories(
        parseInt(page),
        parseInt(limit),
        { status, type, parentCategory, isFeatured, sortBy, sortOrder }
      );

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, 'Categories retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new CategoriesResponseDTO(false, 'Failed to get categories', null, [error.message])
      );
    }
  }

  async searchCategories(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json(
          new CategoriesResponseDTO(false, 'Search term is required', null, ['q parameter is missing'])
        );
      }

      const result = await categoriesService.searchCategories(
        q,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, 'Search results', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new CategoriesResponseDTO(false, 'Failed to search categories', null, [error.message])
      );
    }
  }

  async getCategoryTree(req, res) {
    try {
      const { status } = req.query;
      const result = await categoriesService.getCategoryTree(status);

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, 'Category tree retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new CategoriesResponseDTO(false, 'Failed to get category tree', null, [error.message])
      );
    }
  }

  async getFeaturedCategories(req, res) {
    try {
      const result = await categoriesService.getFeaturedCategories();

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, 'Featured categories retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new CategoriesResponseDTO(false, 'Failed to get featured categories', null, [error.message])
      );
    }
  }

  async getCategoryStatistics(req, res) {
    try {
      const result = await categoriesService.getCategoryStatistics();

      return res.status(200).json(
        new CategoriesResponseDTO(result.success, 'Category statistics retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new CategoriesResponseDTO(false, 'Failed to get category statistics', null, [error.message])
      );
    }
  }
}

module.exports = new CategoriesController();