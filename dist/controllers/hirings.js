"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyHirings = exports.rateHiring = exports.addPayment = exports.updateHiringStatus = exports.createHiring = exports.getHiring = exports.getHirings = void 0;
const Hiring_1 = __importDefault(require("../models/Hiring"));
const Service_1 = __importDefault(require("../models/Service"));
const getHirings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query.$or = [
                { cliente: req.user._id },
                { proveedor: req.user._id }
            ];
        }
        if (req.query.estado) {
            query.estado = req.query.estado;
        }
        if (req.query.fechaInicio) {
            query.fechaInicio = { $gte: new Date(req.query.fechaInicio) };
        }
        if (req.query.fechaFin) {
            query.fechaFin = { $lte: new Date(req.query.fechaFin) };
        }
        const hirings = await Hiring_1.default.find(query)
            .populate('servicio', 'titulo precio categoria ubicacion')
            .populate('cliente', 'nombre email telefono')
            .populate('proveedor', 'nombre email telefono')
            .sort('-createdAt');
        const response = {
            success: true,
            count: hirings.length,
            data: hirings
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting hirings:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getHirings = getHirings;
const getHiring = async (req, res) => {
    try {
        const hiring = await Hiring_1.default.findById(req.params.id)
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
        if (req.user.role !== 'admin' &&
            hiring.cliente.toString() !== req.user._id.toString() &&
            hiring.proveedor.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                error: 'No autorizado para ver esta contratación'
            });
            return;
        }
        const response = {
            success: true,
            data: hiring
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting hiring:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getHiring = getHiring;
const createHiring = async (req, res) => {
    try {
        const { servicioId, fechaInicio, fechaFin, duracion, metodoPago, notas } = req.body;
        const service = await Service_1.default.findById(servicioId);
        if (!service) {
            res.status(404).json({
                success: false,
                error: 'Servicio no encontrado'
            });
            return;
        }
        if (duracion < service.duracionMinima || duracion > service.duracionMaxima) {
            res.status(400).json({
                success: false,
                error: `La duración debe estar entre ${service.duracionMinima} y ${service.duracionMaxima} ${service.unidadTiempo}`
            });
            return;
        }
        const priceCalculation = service.calculatePrice(duracion);
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
        const hiring = await Hiring_1.default.create(hiringData);
        await hiring.populate([
            { path: 'servicio', select: 'titulo precio categoria ubicacion' },
            { path: 'cliente', select: 'nombre email telefono' },
            { path: 'proveedor', select: 'nombre email telefono' }
        ]);
        const response = {
            success: true,
            data: hiring
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating hiring:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.createHiring = createHiring;
const updateHiringStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        const hiring = await Hiring_1.default.findById(req.params.id);
        if (!hiring) {
            res.status(404).json({
                success: false,
                error: 'Contratación no encontrada'
            });
            return;
        }
        if (req.user.role !== 'admin' &&
            hiring.cliente.toString() !== req.user._id.toString() &&
            hiring.proveedor.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                error: 'No autorizado para actualizar esta contratación'
            });
            return;
        }
        hiring.changeStatus(estado);
        await hiring.save();
        const response = {
            success: true,
            data: hiring
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error updating hiring status:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error interno del servidor'
        });
    }
};
exports.updateHiringStatus = updateHiringStatus;
const addPayment = async (req, res) => {
    try {
        const { monto, concepto, comprobante, transactionId } = req.body;
        const hiring = await Hiring_1.default.findById(req.params.id);
        if (!hiring) {
            res.status(404).json({
                success: false,
                error: 'Contratación no encontrada'
            });
            return;
        }
        if (req.user.role !== 'admin' &&
            hiring.cliente.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                error: 'No autorizado para agregar pagos a esta contratación'
            });
            return;
        }
        hiring.addPayment({
            monto,
            concepto,
            comprobante,
            transactionId
        });
        await hiring.save();
        const response = {
            success: true,
            data: hiring
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.addPayment = addPayment;
const rateHiring = async (req, res) => {
    try {
        const { puntuacion, comentario } = req.body;
        const hiring = await Hiring_1.default.findById(req.params.id);
        if (!hiring) {
            res.status(404).json({
                success: false,
                error: 'Contratación no encontrada'
            });
            return;
        }
        if (hiring.cliente.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                error: 'Solo el cliente puede calificar esta contratación'
            });
            return;
        }
        if (hiring.estado !== 'completada') {
            res.status(400).json({
                success: false,
                error: 'Solo se pueden calificar contrataciones completadas'
            });
            return;
        }
        hiring.calificacion = {
            puntuacion,
            comentario,
            fecha: new Date()
        };
        await hiring.save();
        const service = await Service_1.default.findById(hiring.servicio);
        if (service) {
            const allHirings = await Hiring_1.default.find({
                servicio: hiring.servicio,
                'calificacion.puntuacion': { $exists: true }
            });
            const totalRating = allHirings.reduce((sum, h) => sum + (h.calificacion?.puntuacion || 0), 0);
            service.calificacionPromedio = totalRating / allHirings.length;
            service.numeroCalificaciones = allHirings.length;
            await service.save();
        }
        const response = {
            success: true,
            data: hiring
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error rating hiring:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.rateHiring = rateHiring;
const getMyHirings = async (req, res) => {
    try {
        const hirings = await Hiring_1.default.find({
            $or: [
                { cliente: req.user._id },
                { proveedor: req.user._id }
            ]
        })
            .populate('servicio', 'titulo precio categoria ubicacion imagenes')
            .populate('cliente', 'nombre email telefono')
            .populate('proveedor', 'nombre email telefono')
            .sort('-createdAt');
        const response = {
            success: true,
            count: hirings.length,
            data: hirings
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error getting user hirings:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getMyHirings = getMyHirings;
//# sourceMappingURL=hirings.js.map