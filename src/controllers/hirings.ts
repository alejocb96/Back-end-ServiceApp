import { Request, Response } from 'express';
import Hiring from '../models/Hiring';
import Service from '../models/Service';
import { AuthenticatedRequest, ApiResponse, HiringFilters } from '../types';

// @desc    Get all hirings
// @route   GET /api/hirings
// @access  Private/Admin
export const getHirings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let query: any = {};

    // If not admin, only show user's hirings
    if (req.user.role !== 'admin') {
      query.$or = [
        { cliente: req.user._id },
        { proveedor: req.user._id }
      ];
    }

    // Apply filters
    if (req.query.estado) {
      query.estado = req.query.estado;
    }

    if (req.query.fechaInicio) {
      query.fechaInicio = { $gte: new Date(req.query.fechaInicio as string) };
    }

    if (req.query.fechaFin) {
      query.fechaFin = { $lte: new Date(req.query.fechaFin as string) };
    }

    const hirings = await Hiring.find(query)
      .populate('servicio', 'titulo precio categoria ubicacion')
      .populate('cliente', 'nombre email telefono')
      .populate('proveedor', 'nombre email telefono')
      .sort('-createdAt');

    const response: ApiResponse = {
      success: true,
      count: hirings.length,
      data: hirings
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting hirings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Get single hiring
// @route   GET /api/hirings/:id
// @access  Private
export const getHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hiring = await Hiring.findById(req.params.id)
      .populate('servicio', 'titulo precio categoria ubicacion')
      .populate('cliente', 'nombre email telefono')
      .populate('proveedor', 'nombre email telefono');

    if (!hiring) {
      res.status(404).json({
        success: false,
        error: 'Contratación no encontrada'
      });
      return;
    }

    // Check if user has access to this hiring
    if (req.user.role !== 'admin' && 
        hiring.cliente.toString() !== req.user._id.toString() && 
        hiring.proveedor.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        error: 'No autorizado para ver esta contratación'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: hiring
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting hiring:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Create new hiring
// @route   POST /api/hirings
// @access  Private
export const createHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { servicioId, fechaInicio, fechaFin, duracion, metodoPago, notas } = req.body;

    // Get service details
    const service = await Service.findById(servicioId);
    if (!service) {
      res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
      return;
    }

    // Validate duration
    if (duracion < service.duracionMinima || duracion > service.duracionMaxima) {
      res.status(400).json({
        success: false,
        error: `La duración debe estar entre ${service.duracionMinima} y ${service.duracionMaxima} ${service.unidadTiempo}`
      });
      return;
    }

    // Calculate pricing
    const priceCalculation = service.calculatePrice(duracion);

    // Create hiring
    const hiringData = {
      servicio: servicioId,
      cliente: req.user._id,
      proveedor: service.proveedor,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      duracion,
      precioBase: priceCalculation.precioBase,
      comisionPlataforma: priceCalculation.comisionPlataforma,
      precioTotal: priceCalculation.precioTotal,
      precioFinal: priceCalculation.precioFinal,
      metodoPago,
      notas
    };

    const hiring = await Hiring.create(hiringData);

    // Populate the response
    await hiring.populate([
      { path: 'servicio', select: 'titulo precio categoria ubicacion' },
      { path: 'cliente', select: 'nombre email telefono' },
      { path: 'proveedor', select: 'nombre email telefono' }
    ]);

    const response: ApiResponse = {
      success: true,
      data: hiring
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating hiring:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Update hiring status
// @route   PUT /api/hirings/:id/status
// @access  Private
export const updateHiringStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { estado } = req.body;
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      res.status(404).json({
        success: false,
        error: 'Contratación no encontrada'
      });
      return;
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        hiring.cliente.toString() !== req.user._id.toString() && 
        hiring.proveedor.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        error: 'No autorizado para actualizar esta contratación'
      });
      return;
    }

    // Update status
    hiring.changeStatus(estado);
    await hiring.save();

    const response: ApiResponse = {
      success: true,
      data: hiring
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating hiring status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
};

// @desc    Add payment to hiring
// @route   POST /api/hirings/:id/payment
// @access  Private
export const addPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { monto, concepto, comprobante, transactionId } = req.body;
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      res.status(404).json({
        success: false,
        error: 'Contratación no encontrada'
      });
      return;
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        hiring.cliente.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        error: 'No autorizado para agregar pagos a esta contratación'
      });
      return;
    }

    // Add payment
    hiring.addPayment({
      monto,
      concepto,
      comprobante,
      transactionId
    });

    await hiring.save();

    const response: ApiResponse = {
      success: true,
      data: hiring
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Rate hiring
// @route   POST /api/hirings/:id/rate
// @access  Private
export const rateHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { puntuacion, comentario } = req.body;
    const hiring = await Hiring.findById(req.params.id);

    if (!hiring) {
      res.status(404).json({
        success: false,
        error: 'Contratación no encontrada'
      });
      return;
    }

    // Check permissions - only client can rate
    if (hiring.cliente.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        error: 'Solo el cliente puede calificar esta contratación'
      });
      return;
    }

    // Check if hiring is completed
    if (hiring.estado !== 'completada') {
      res.status(400).json({
        success: false,
        error: 'Solo se pueden calificar contrataciones completadas'
      });
      return;
    }

    // Add rating
    hiring.calificacion = {
      puntuacion,
      comentario,
      fecha: new Date()
    };

    await hiring.save();

    // Update service rating
    const service = await Service.findById(hiring.servicio);
    if (service) {
      const allHirings = await Hiring.find({ 
        servicio: hiring.servicio, 
        'calificacion.puntuacion': { $exists: true } 
      });
      
      const totalRating = allHirings.reduce((sum, h) => sum + (h.calificacion?.puntuacion || 0), 0);
      service.calificacionPromedio = totalRating / allHirings.length;
      service.numeroCalificaciones = allHirings.length;
      
      await service.save();
    }

    const response: ApiResponse = {
      success: true,
      data: hiring
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error rating hiring:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Get user hirings
// @route   GET /api/hirings/my
// @access  Private
export const getMyHirings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hirings = await Hiring.find({
      $or: [
        { cliente: req.user._id },
        { proveedor: req.user._id }
      ]
    })
      .populate('servicio', 'titulo precio categoria ubicacion imagenes')
      .populate('cliente', 'nombre email telefono')
      .populate('proveedor', 'nombre email telefono')
      .sort('-createdAt');

    const response: ApiResponse = {
      success: true,
      count: hirings.length,
      data: hirings
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting user hirings:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
