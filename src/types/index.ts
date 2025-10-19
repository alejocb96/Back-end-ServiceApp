import { Request } from 'express';
import { Document } from 'mongoose';

// Tipos para el usuario
export interface IUser extends Document {
  _id: string;
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  role: 'tenant' | 'provider' | 'admin';
  avatar?: string;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

// Tipos para el servicio
export interface IService extends Document {
  _id: string;
  titulo: string;
  descripcion: string;
  categoria: 'limpieza' | 'reparaciones' | 'jardineria' | 'cocina' | 'transporte' | 'cuidado_personal' | 'tecnologia' | 'educacion' | 'otros';
  precio: number;
  unidadTiempo: 'hora' | 'dia' | 'semana' | 'mes' | 'proyecto';
  duracionMinima: number;
  duracionMaxima: number;
  ubicacion: {
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  };
  modalidad: 'presencial' | 'remoto' | 'hibrido';
  requisitos: string[];
  habilidades: string[];
  horarios: {
    [key: string]: {
      disponible: boolean;
      inicio?: string;
      fin?: string;
    };
  };
  imagenes: Array<{
    url: string;
    public_id: string;
  }>;
  disponible: boolean;
  proveedor: string | IUser;
  calificacionPromedio: number;
  numeroCalificaciones: number;
  numeroContrataciones: number;
  comisionPlataforma: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para la contratación
export interface IHiring extends Document {
  _id: string;
  servicio: string | IService;
  cliente: string | IUser;
  proveedor: string | IUser;
  fechaInicio: Date;
  fechaFin: Date;
  duracion: number;
  precioBase: number;
  comisionPlataforma: number;
  precioTotal: number;
  precioFinal: number; // precio que paga el cliente (precioTotal + comision)
  estado: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada';
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta' | 'paypal' | 'stripe';
  pagoRealizado: boolean;
  fechaPago?: Date;
  transactionId?: string;
  notas?: string;
  calificacion?: {
    puntuacion: number;
    comentario?: string;
    fecha: Date;
  };
  historialPagos: Array<{
    fecha: Date;
    monto: number;
    concepto: string;
    comprobante?: string;
    transactionId?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para notificaciones
export interface INotification extends Document {
  _id: string;
  usuario: string | IUser;
  tipo: 'hiring_request' | 'hiring_confirmed' | 'hiring_cancelled' | 'payment_received' | 'rating_received' | 'service_update' | 'system';
  titulo: string;
  mensaje: string;
  leida: boolean;
  metadata?: {
    hiringId?: string;
    serviceId?: string;
    userId?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

// Tipos para Request con usuario autenticado
export interface AuthenticatedRequest extends Request {
  user: IUser;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    prev?: {
      page: number;
      limit: number;
    };
    next?: {
      page: number;
      limit: number;
    };
  };
}

// Tipos para filtros de búsqueda
export interface ServiceFilters {
  categoria?: string;
  precioMin?: number;
  precioMax?: number;
  ciudad?: string;
  modalidad?: string;
  disponible?: boolean;
  calificacionMin?: number;
  q?: string; // búsqueda de texto
}

export interface HiringFilters {
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  proveedor?: string;
  cliente?: string;
  servicio?: string;
}

// Tipos para cálculos de precios
export interface PriceCalculation {
  precioBase: number;
  duracion: number;
  comisionPlataforma: number;
  comisionMonto: number;
  precioTotal: number;
  precioFinal: number; // lo que paga el cliente
  precioProveedor: number; // lo que recibe el proveedor
}

// Tipos para estadísticas
export interface UserStats {
  totalHirings: number;
  completedHirings: number;
  cancelledHirings: number;
  averageRating: number;
  totalEarnings?: number; // solo para proveedores
  totalSpent?: number; // solo para clientes
}

export interface ServiceStats {
  totalViews: number;
  totalHirings: number;
  completedHirings: number;
  averageRating: number;
  totalEarnings: number;
  conversionRate: number;
}

// Tipos para configuración de pagos
export interface PaymentConfig {
  provider: 'stripe' | 'paypal' | 'mercadopago';
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  supportedMethods: string[];
}

// Tipos para emails
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, any>;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Tipos para archivos subidos
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  filename: string;
  path: string;
  url?: string;
  public_id?: string;
} 