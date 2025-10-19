"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicesByProvider = exports.calculateServicePrice = exports.searchServices = exports.deleteService = exports.updateService = exports.createService = exports.getService = exports.getServices = void 0;
const Service_1 = __importDefault(require("../models/Service"));
const getServices = async (req, res) => {
    try {
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        let query = Service_1.default.find(JSON.parse(queryStr)).populate('proveedor', 'nombre email telefono avatar');
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Service_1.default.countDocuments(JSON.parse(queryStr));
        query = query.skip(startIndex).limit(limit);
        const services = await query;
        const pagination = {};
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
        const response = {
            success: true,
            count: services.length,
            pagination,
            data: services
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getServices = getServices;
const getService = async (req, res) => {
    try {
        const service = await Service_1.default.findById(req.params.id).populate('proveedor', 'nombre email telefono avatar');
        if (!service) {
            res.status(404).json({
                success: false,
                error: 'Servicio no encontrado'
            });
            return;
        }
        const response = {
            success: true,
            data: service
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting service:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getService = getService;
const createService = async (req, res) => {
    try {
        req.body.proveedor = req.user._id;
        const service = await Service_1.default.create(req.body);
        const response = {
            success: true,
            data: service
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        let service = await Service_1.default.findById(req.params.id);
        if (!service) {
            res.status(404).json({
                success: false,
                error: 'Servicio no encontrado'
            });
            return;
        }
        if (service.proveedor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401).json({
                success: false,
                error: 'No autorizado para actualizar este servicio'
            });
            return;
        }
        service = await Service_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        const response = {
            success: true,
            data: service
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const service = await Service_1.default.findById(req.params.id);
        if (!service) {
            res.status(404).json({
                success: false,
                error: 'Servicio no encontrado'
            });
            return;
        }
        if (service.proveedor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401).json({
                success: false,
                error: 'No autorizado para eliminar este servicio'
            });
            return;
        }
        await service.deleteOne();
        const response = {
            success: true,
            data: {}
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.deleteService = deleteService;
const searchServices = async (req, res) => {
    try {
        const { q, categoria, precioMin, precioMax, ciudad, modalidad, calificacionMin } = req.query;
        let query = {};
        if (q) {
            query.$text = { $search: q };
        }
        if (categoria) {
            query.categoria = categoria;
        }
        if (ciudad) {
            query['ubicacion.ciudad'] = new RegExp(ciudad, 'i');
        }
        if (modalidad) {
            query.modalidad = modalidad;
        }
        if (precioMin || precioMax) {
            query.precio = {};
            if (precioMin)
                query.precio.$gte = parseInt(precioMin);
            if (precioMax)
                query.precio.$lte = parseInt(precioMax);
        }
        if (calificacionMin) {
            query.calificacionPromedio = { $gte: parseInt(calificacionMin) };
        }
        query.disponible = true;
        query.isActive = true;
        const services = await Service_1.default.find(query)
            .populate('proveedor', 'nombre email telefono avatar')
            .sort({ calificacionPromedio: -1, createdAt: -1 });
        const response = {
            success: true,
            count: services.length,
            data: services
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error searching services:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.searchServices = searchServices;
const calculateServicePrice = async (req, res) => {
    try {
        const { duracion } = req.body;
        const service = await Service_1.default.findById(req.params.id);
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
        const response = {
            success: true,
            data: priceCalculation
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.calculateServicePrice = calculateServicePrice;
const getServicesByProvider = async (req, res) => {
    try {
        const services = await Service_1.default.find({ proveedor: req.params.providerId })
            .populate('proveedor', 'nombre email telefono avatar');
        const response = {
            success: true,
            count: services.length,
            data: services
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting services by provider:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getServicesByProvider = getServicesByProvider;
//# sourceMappingURL=services.js.map