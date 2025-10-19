import { Request, Response } from 'express';
import Service from '../models/Service';
import { AuthenticatedRequest, ApiResponse, ServiceFilters } from '../types';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Service.find(JSON.parse(queryStr)).populate('proveedor', 'nombre email telefono avatar');

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const services = await query;

    // Pagination result
    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    const response: ApiResponse = {
      success: true,
      count: services.length,
      pagination,
      data: services
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate('proveedor', 'nombre email telefono avatar');

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: service
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting service:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Provider
export const createService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Add user to req.body
    req.body.proveedor = req.user._id;

    const service = await Service.create(req.body);

    const response: ApiResponse = {
      success: true,
      data: service
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Provider
export const updateService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
      return;
    }

    // Make sure user is service owner or admin
    if (service.proveedor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para actualizar este servicio'
      });
      return;
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const response: ApiResponse = {
      success: true,
      data: service
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Provider
export const deleteService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
      return;
    }

    // Make sure user is service owner or admin
    if (service.proveedor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'No autorizado para eliminar este servicio'
      });
      return;
    }

    await service.deleteOne();

    const response: ApiResponse = {
      success: true,
      data: {}
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
export const searchServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, categoria, precioMin, precioMax, ciudad, modalidad, calificacionMin } = req.query;

    let query: any = {};

    // Text search
    if (q) {
      query.$text = { $search: q as string };
    }

    // Filter by category
    if (categoria) {
      query.categoria = categoria;
    }

    // Filter by city
    if (ciudad) {
      query['ubicacion.ciudad'] = new RegExp(ciudad as string, 'i');
    }

    // Filter by modality
    if (modalidad) {
      query.modalidad = modalidad;
    }

    // Price range
    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = parseInt(precioMin as string);
      if (precioMax) query.precio.$lte = parseInt(precioMax as string);
    }

    // Rating filter
    if (calificacionMin) {
      query.calificacionPromedio = { $gte: parseInt(calificacionMin as string) };
    }

    // Only available and active services
    query.disponible = true;
    query.isActive = true;

    const services = await Service.find(query)
      .populate('proveedor', 'nombre email telefono avatar')
      .sort({ calificacionPromedio: -1, createdAt: -1 });

    const response: ApiResponse = {
      success: true,
      count: services.length,
      data: services
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Calculate service price
// @route   POST /api/services/:id/calculate-price
// @access  Public
export const calculateServicePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { duracion } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
      return;
    }

    if (!duracion || duracion < service.duracionMinima || duracion > service.duracionMaxima) {
      res.status(400).json({
        success: false,
        error: `La duración debe estar entre ${service.duracionMinima} y ${service.duracionMaxima} ${service.unidadTiempo}`
      });
      return;
    }

    const priceCalculation = service.calculatePrice(duracion);

    const response: ApiResponse = {
      success: true,
      data: priceCalculation
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Get services by provider
// @route   GET /api/services/provider/:providerId
// @access  Public
export const getServicesByProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ proveedor: req.params.providerId })
      .populate('proveedor', 'nombre email telefono avatar');

    const response: ApiResponse = {
      success: true,
      count: services.length,
      data: services
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting services by provider:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
