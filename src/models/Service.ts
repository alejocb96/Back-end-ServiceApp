import mongoose, { Schema } from 'mongoose';
import { IService } from '@/types';

const ServiceSchema: Schema<IService> = new Schema({
  titulo: {
    type: String,
    required: [true, 'El título del servicio es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['limpieza', 'reparaciones', 'jardineria', 'cocina', 'transporte', 'cuidado_personal', 'tecnologia', 'educacion', 'otros']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  unidadTiempo: {
    type: String,
    required: [true, 'La unidad de tiempo es requerida'],
    enum: ['hora', 'dia', 'semana', 'mes', 'proyecto']
  },
  duracionMinima: {
    type: Number,
    required: [true, 'La duración mínima es requerida'],
    min: [1, 'La duración mínima debe ser al menos 1']
  },
  duracionMaxima: {
    type: Number,
    required: [true, 'La duración máxima es requerida'],
    min: [1, 'La duración máxima debe ser al menos 1']
  },
  ubicacion: {
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida']
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es requerida']
    },
    estado: {
      type: String,
      required: [true, 'El estado es requerido']
    },
    codigoPostal: {
      type: String,
      required: [true, 'El código postal es requerido']
    },
    coordenadas: {
      latitud: {
        type: Number,
        required: false
      },
      longitud: {
        type: Number,
        required: false
      }
    }
  },
  modalidad: {
    type: String,
    required: [true, 'La modalidad es requerida'],
    enum: ['presencial', 'remoto', 'hibrido']
  },
  requisitos: [{
    type: String,
    maxlength: [200, 'Cada requisito no puede tener más de 200 caracteres']
  }],
  habilidades: [{
    type: String,
    maxlength: [50, 'Cada habilidad no puede tener más de 50 caracteres']
  }],
  horarios: {
    lunes: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    },
    martes: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    },
    miercoles: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    },
    jueves: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    },
    viernes: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    },
    sabado: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    },
    domingo: { 
      disponible: { type: Boolean, default: false }, 
      inicio: { type: String, required: false }, 
      fin: { type: String, required: false }
    }
  },
  imagenes: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  }],
  disponible: {
    type: Boolean,
    default: true
  },
  proveedor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calificacionPromedio: {
    type: Number,
    min: [1, 'La calificación debe ser al menos 1'],
    max: [5, 'La calificación no puede ser mayor a 5'],
    default: 0
  },
  numeroCalificaciones: {
    type: Number,
    default: 0
  },
  numeroContrataciones: {
    type: Number,
    default: 0
  },
  comisionPlataforma: {
    type: Number,
    default: 10, // 10% por defecto
    min: [0, 'La comisión no puede ser negativa'],
    max: [50, 'La comisión no puede ser mayor al 50%']
  },
  isActive: {
    type: Boolean,
    default: true
  },
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
ServiceSchema.pre<IService>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validación personalizada para duraciones
ServiceSchema.pre<IService>('save', function(next) {
  if (this.duracionMaxima < this.duracionMinima) {
    next(new Error('La duración máxima debe ser mayor o igual a la duración mínima'));
  }
  next();
});

// Método para calcular precio con comisión
ServiceSchema.methods.calculatePrice = function(duracion: number) {
  const precioBase = this.precio * duracion;
  const comisionMonto = (precioBase * this.comisionPlataforma) / 100;
  const precioTotal = precioBase;
  const precioFinal = precioBase + comisionMonto;
  const precioProveedor = precioBase - comisionMonto;

  return {
    precioBase,
    duracion,
    comisionPlataforma: this.comisionPlataforma,
    comisionMonto,
    precioTotal,
    precioFinal,
    precioProveedor
  };
};

// Índices para búsquedas eficientes
ServiceSchema.index({ titulo: 'text', descripcion: 'text' });
ServiceSchema.index({ categoria: 1 });
ServiceSchema.index({ precio: 1 });
ServiceSchema.index({ 'ubicacion.ciudad': 1 });
ServiceSchema.index({ disponible: 1, isActive: 1 });
ServiceSchema.index({ proveedor: 1 });
ServiceSchema.index({ calificacionPromedio: -1 });

export default mongoose.model<IService>('Service', ServiceSchema); 