import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'No autorizado, usuario no encontrado'
        });
        return;
      }

      next();
    } catch (error) {
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

// Admin middleware
const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado - Se requieren permisos de administrador'
    });
  }
};

// Provider or Admin middleware
const providerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'provider')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado - Se requieren permisos de proveedor o administrador'
    });
  }
};

// User or Admin middleware (for accessing own resources)
const userOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const resourceUserId = req.params.userId || req.params.id;
  
  if (req.user && (req.user.role === 'admin' || req.user._id.toString() === resourceUserId)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado - Solo puedes acceder a tus propios recursos'
    });
  }
};

export { protect, admin, providerOrAdmin, userOrAdmin };
