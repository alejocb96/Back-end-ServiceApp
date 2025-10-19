import mongoose, { Schema } from 'mongoose';
import { IHiring } from '@/types';

const HiringSchema: Schema<IHiring> = new Schema({
  servicio: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'El servicio es requerido']
  },
  cliente: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es requerido']
  },
  proveedor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El proveedor es requerido']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es requerida']
  },
  duracion: {
    type: Number,
    required: [true, 'La duración es requerida'],
    min: [1, 'La duración debe ser al menos 1']
  },
  precioBase: {
    type: Number,
    required: [true, 'El precio base es requerido'],
    min: [0, 'El precio base no puede ser negativo']
  },
  comisionPlataforma: {
    type: Number,
    required: [true, 'La comisión de plataforma es requerida'],
    min: [0, 'La comisión no puede ser negativa'],
    max: [50, 'La comisión no puede ser mayor al 50%']
  },
  precioTotal: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio total no puede ser negativo']
  },
  precioFinal: {
    type: Number,
    required: [true, 'El precio final es requerido'],
    min: [0, 'El precio final no puede ser negativo']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'transferencia', 'tarjeta', 'paypal', 'stripe'],
    required: [true, 'El método de pago es requerido']
  },
  pagoRealizado: {
    type: Boolean,
    default: false
  },
  fechaPago: {
    type: Date,
    required: false
  },
  transactionId: {
    type: String,
    required: false
  },
  notas: {
    type: String,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
  },
  calificacion: {
    puntuacion: {
      type: Number,
      min: [1, 'La calificación debe ser al menos 1'],
      max: [5, 'La calificación no puede ser mayor a 5']
    },
    comentario: {
      type: String,
      maxlength: [500, 'El comentario no puede tener más de 500 caracteres']
    },
    fecha: {
      type: Date
    }
  },
  historialPagos: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    monto: {
      type: Number,
      required: true
    },
    concepto: {
      type: String,
      required: true
    },
    comprobante: {
      type: String
    },
    transactionId: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
HiringSchema.pre<IHiring>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validate that end date is after start date
HiringSchema.pre<IHiring>('save', function(next) {
  if (this.fechaFin <= this.fechaInicio) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }
  next();
});

// Método para calcular precios automáticamente
HiringSchema.methods.calculatePricing = function() {
  const comisionMonto = (this.precioBase * this.comisionPlataforma) / 100;
  this.precioTotal = this.precioBase;
  this.precioFinal = this.precioBase + comisionMonto;
  
  return {
    precioBase: this.precioBase,
    comisionPlataforma: this.comisionPlataforma,
    comisionMonto,
    precioTotal: this.precioTotal,
    precioFinal: this.precioFinal,
    precioProveedor: this.precioBase - comisionMonto
  };
};

// Método para agregar pago al historial
HiringSchema.methods.addPayment = function(pago: { monto: number; concepto: string; comprobante?: string; transactionId?: string }) {
  this.historialPagos.push({
    fecha: new Date(),
    monto: pago.monto,
    concepto: pago.concepto,
    comprobante: pago.comprobante,
    transactionId: pago.transactionId
  });

  // Verificar si el pago total cubre el precio final
  const totalPagado = this.historialPagos.reduce((total: number, pago: any) => total + pago.monto, 0);
  if (totalPagado >= this.precioFinal) {
    this.pagoRealizado = true;
    this.fechaPago = new Date();
  }
};

// Método para cambiar estado con validaciones
HiringSchema.methods.changeStatus = function(nuevoEstado: string) {
  const estadosValidos = ['pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada'];
  
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado no válido');
  }

  // Validaciones de transiciones de estado
  if (this.estado === 'completada' && nuevoEstado !== 'completada') {
    throw new Error('No se puede cambiar el estado de una contratación completada');
  }

  if (this.estado === 'cancelada' && nuevoEstado !== 'cancelada') {
    throw new Error('No se puede cambiar el estado de una contratación cancelada');
  }

  this.estado = nuevoEstado;
  this.updatedAt = new Date();
};

// Create index for efficient queries
HiringSchema.index({ servicio: 1, fechaInicio: 1, fechaFin: 1 });
HiringSchema.index({ cliente: 1, estado: 1 });
HiringSchema.index({ proveedor: 1, estado: 1 });
HiringSchema.index({ estado: 1, fechaInicio: 1 });
HiringSchema.index({ createdAt: -1 });

export default mongoose.model<IHiring>('Hiring', HiringSchema); 