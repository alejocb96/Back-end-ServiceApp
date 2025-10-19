"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOrAdmin = exports.providerOrAdmin = exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = await User_1.default.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'No autorizado, usuario no encontrado'
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('❌ Error en autenticación:', error);
            res.status(401).json({
                success: false,
                error: 'No autorizado, token inválido'
            });
            return;
        }
    }
    if (!token) {
        res.status(401).json({
            success: false,
            error: 'No autorizado, no se proporcionó token'
        });
        return;
    }
};
exports.protect = protect;
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            error: 'Acceso denegado - Se requieren permisos de administrador'
        });
    }
};
exports.admin = admin;
const providerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'provider')) {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            error: 'Acceso denegado - Se requieren permisos de proveedor o administrador'
        });
    }
};
exports.providerOrAdmin = providerOrAdmin;
const userOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.userId || req.params.id;
    if (req.user && (req.user.role === 'admin' || req.user._id.toString() === resourceUserId)) {
        next();
    }
    else {
        res.status(403).json({
            success: false,
            error: 'Acceso denegado - Solo puedes acceder a tus propios recursos'
        });
    }
};
exports.userOrAdmin = userOrAdmin;
//# sourceMappingURL=auth.js.map