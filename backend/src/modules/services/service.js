const { SERVICE_CATEGORY, DEFAULT_PAGE, DEFAULT_LIMIT, SORT_FIELDS, SORT_ORDER } = require('./constants');

class ServicesService {
  async createService(serviceData) {
    try {
      const { Service } = require('./model');
      
      const service = await Service.create(serviceData);
      
      return {
        success: true,
        data: service,
        message: 'Service created successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Service with this slug already exists');
      }
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  async getServiceBySlug(slug) {
    try {
      const { Service } = require('./model');
      
      const service = await Service.findOne({ slug, isPublished: true }).lean();
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      return {
        success: true,
        data: service,
      };
    } catch (error) {
      throw new Error(`Failed to get service: ${error.message}`);
    }
  }

  async getServiceById(id) {
    try {
      const { Service } = require('./model');
      
      const service = await Service.findById(id).lean();
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      return {
        success: true,
        data: service,
      };
    } catch (error) {
      throw new Error(`Failed to get service: ${error.message}`);
    }
  }

  async getAllServices(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, filters = {}) {
    try {
      const { Service } = require('./model');
      const skip = (page - 1) * limit;
      const query = { isPublished: true };
      
      if (filters.category) query.category = filters.category;
      if (filters.isPopular !== undefined) query.isPopular = filters.isPopular;
      
      const sortField = SORT_FIELDS[filters.sortBy] || SORT_FIELDS.order;
      const sortValue = filters.sortOrder === SORT_ORDER.ASC ? 1 : -1;
      const sort = { [sortField]: sortValue };
      
      const services = await Service.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Service.countDocuments(query);
      
      return {
        success: true,
        data: {
          data: services,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get services: ${error.message}`);
    }
  }

  async searchServices(searchTerm, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    try {
      const { Service } = require('./model');
      const skip = (page - 1) * limit;
      
      const query = {
        isPublished: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { shortDescription: { $regex: searchTerm, $options: 'i' } },
        ],
      };
      
      const services = await Service.find(query)
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Service.countDocuments(query);
      
      return {
        success: true,
        data: {
          data: services,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to search services: ${error.message}`);
    }
  }

  async updateService(id, updates) {
    try {
      const { Service } = require('./model');
      
      const service = await Service.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      return {
        success: true,
        data: service,
        message: 'Service updated successfully',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Service with this slug already exists');
      }
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  async deleteService(id) {
    try {
      const { Service } = require('./model');
      
      const service = await Service.findByIdAndDelete(id);
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      return {
        success: true,
        message: 'Service deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const { Service } = require('./model');
      
      const categories = await Service.distinct('category', { isPublished: true });
      
      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async getPopularServices(limit = 6) {
    try {
      const { Service } = require('./model');
      
      const services = await Service.find({
        isPopular: true,
        isPublished: true,
      })
        .sort({ order: 1 })
        .limit(limit)
        .lean();
      
      return {
        success: true,
        data: services,
      };
    } catch (error) {
      throw new Error(`Failed to get popular services: ${error.message}`);
    }
  }

  async getServiceStatistics() {
    try {
      const { Service } = require('./model');
      
      const totalServices = await Service.countDocuments({ isPublished: true });
      const popularServices = await Service.countDocuments({ isPopular: true, isPublished: true });
      
      const servicesByCategory = await Service.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
      
      return {
        success: true,
        data: {
          totalServices,
          popularServices,
          servicesByCategory: servicesByCategory.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get service statistics: ${error.message}`);
    }
  }
}

module.exports = new ServicesService();