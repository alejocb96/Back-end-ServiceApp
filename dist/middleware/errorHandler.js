"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('❌ Error:', err);
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado';
        error = { ...error, message, statusCode: 404 };
    }
    if (err.code === 11000) {
        const message = 'Datos duplicados';
        error = { ...error, message, statusCode: 400 };
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {}).map(val => val.message).join(', ');
        error = { ...error, message, statusCode: 400 };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = { ...error, message, statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { ...error, message, statusCode: 401 };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map