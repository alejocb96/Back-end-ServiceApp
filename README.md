# 🏠 RentApp Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> **API REST completa para una plataforma de servicios de alquiler y contratación de servicios profesionales**

RentApp es una plataforma que conecta clientes con proveedores de servicios, permitiendo la contratación de servicios como limpieza, reparaciones, jardinería, cocina, transporte, cuidado personal, tecnología, educación y más.

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- **Registro y autenticación** con JWT
- **Roles de usuario**: Cliente, Proveedor, Administrador
- **Recuperación de contraseña** por email
- **Perfiles de usuario** con avatar y datos de contacto
- **Gestión de sesiones** segura

### 🛠️ Gestión de Servicios
- **Catálogo completo** de servicios por categorías
- **Búsqueda avanzada** con filtros múltiples
- **Gestión de precios** con comisiones de plataforma
- **Sistema de calificaciones** y reseñas
- **Subida de imágenes** con Cloudinary
- **Horarios de disponibilidad** por día de la semana
- **Modalidades**: Presencial, Remoto, Híbrido

### 📋 Sistema de Contrataciones
- **Proceso completo** de contratación de servicios
- **Gestión de estados**: Pendiente, Confirmada, En Progreso, Completada, Cancelada
- **Sistema de pagos** con múltiples métodos
- **Historial de pagos** detallado
- **Cálculo automático** de precios y comisiones
- **Sistema de calificaciones** post-servicio

### 🔒 Seguridad y Middleware
- **Autenticación JWT** con cookies seguras
- **Rate limiting** para prevenir abuso
- **Validación de datos** con Joi
- **Middleware de autorización** por roles
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Compresión** de respuestas

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Autenticación y Seguridad
- **JWT** - Tokens de autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Helmet** - Headers de seguridad
- **express-rate-limit** - Limitación de requests

### Utilidades
- **Nodemailer** - Envío de emails
- **Cloudinary** - Gestión de imágenes
- **Multer** - Subida de archivos
- **Morgan** - Logging de requests
- **Compression** - Compresión de respuestas

### Desarrollo
- **ts-node-dev** - Desarrollo con hot reload
- **ESLint** - Linting de código
- **Jest** - Testing framework
- **Supertest** - Testing de APIs

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración de base de datos
├── controllers/      # Lógica de negocio y controladores
│   ├── auth.ts      # Autenticación y usuarios
│   ├── services.ts  # Gestión de servicios
│   ├── users.ts     # Administración de usuarios
│   └── hirings.ts   # Contrataciones y pagos
├── middleware/       # Middleware personalizado
│   ├── auth.ts      # Autenticación y autorización
│   ├── errorHandler.ts # Manejo de errores
│   └── notFound.ts  # Manejo de rutas no encontradas
├── models/          # Modelos de MongoDB
│   ├── User.ts      # Modelo de usuario
│   ├── Service.ts   # Modelo de servicio
│   └── Hiring.ts    # Modelo de contratación
├── routes/          # Definición de rutas
│   ├── auth.ts      # Rutas de autenticación
│   ├── services.ts  # Rutas de servicios
│   ├── users.ts     # Rutas de usuarios
│   └── hirings.ts   # Rutas de contrataciones
├── types/           # Definiciones de tipos TypeScript
├── utils/           # Utilidades y helpers
└── server.ts        # Punto de entrada de la aplicación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16.0.0 o superior
- MongoDB 4.4 o superior
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/alejocb96/Back-end-ServiceApp.git
cd Back-end-ServiceApp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo de ejemplo y configura tus variables:
```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del servidor
NODE_ENV=development
PORT=5000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/rentapp

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (para recuperación de contraseña)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=tu_email@example.com
SMTP_PASSWORD=tu_password
FROM_EMAIL=noreply@rentapp.com
FROM_NAME=RentApp

# Cloudinary (para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Ejecutar la aplicación

#### Desarrollo
```bash
npm run dev
```

#### Producción
```bash
npm run build
npm start
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:5000/api
```

### Endpoints Principales

#### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| POST | `/register` | Registro de usuario | Público |
| POST | `/login` | Inicio de sesión | Público |
| GET | `/me` | Obtener perfil actual | Privado |
| PUT | `/updatedetails` | Actualizar datos personales | Privado |
| PUT | `/updatepassword` | Cambiar contraseña | Privado |
| POST | `/forgotpassword` | Solicitar reset de contraseña | Público |
| PUT | `/resetpassword/:token` | Resetear contraseña | Público |

#### 🛠️ Servicios (`/api/services`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/` | Listar todos los servicios | Público |
| GET | `/search` | Buscar servicios con filtros | Público |
| GET | `/:id` | Obtener servicio específico | Público |
| GET | `/provider/:id` | Servicios por proveedor | Público |
| POST | `/:id/calculate-price` | Calcular precio | Público |
| POST | `/` | Crear nuevo servicio | Proveedor/Admin |
| PUT | `/:id` | Actualizar servicio | Propietario/Admin |
| DELETE | `/:id` | Eliminar servicio | Propietario/Admin |

#### 👥 Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/` | Listar todos los usuarios | Admin |
| GET | `/:id` | Obtener usuario específico | Admin |
| POST | `/` | Crear usuario | Admin |
| PUT | `/:id` | Actualizar usuario | Admin |
| DELETE | `/:id` | Eliminar usuario | Admin |

#### 📋 Contrataciones (`/api/hirings`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/` | Listar todas las contrataciones | Admin |
| GET | `/my` | Mis contrataciones | Usuario |
| GET | `/:id` | Obtener contratación específica | Participante |
| POST | `/` | Crear nueva contratación | Usuario |
| PUT | `/:id/status` | Actualizar estado | Participante |
| POST | `/:id/payment` | Agregar pago | Cliente |
| POST | `/:id/rate` | Calificar servicio | Cliente |

### Ejemplos de Uso

#### Registro de Usuario
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "telefono": "1234567890",
    "role": "tenant"
  }'
```

#### Crear Servicio
```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "titulo": "Limpieza de hogar",
    "descripcion": "Servicio completo de limpieza residencial",
    "categoria": "limpieza",
    "precio": 25,
    "unidadTiempo": "hora",
    "duracionMinima": 2,
    "duracionMaxima": 8,
    "ubicacion": {
      "direccion": "Calle Principal 123",
      "ciudad": "Ciudad de México",
      "estado": "CDMX",
      "codigoPostal": "01000"
    },
    "modalidad": "presencial"
  }'
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run dev:debug    # Servidor con debugging

# Producción
npm run build        # Compilar TypeScript
npm start           # Ejecutar en producción

# Calidad de código
npm run lint        # Verificar código
npm run lint:fix    # Corregir problemas automáticamente
npm run type-check  # Verificar tipos TypeScript

# Testing
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch
```

## 🏗️ Modelos de Datos

### Usuario (User)
```typescript
{
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  role: 'tenant' | 'provider' | 'admin';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}
```

### Servicio (Service)
```typescript
{
  titulo: string;
  descripcion: string;
  categoria: string;
  precio: number;
  unidadTiempo: string;
  duracionMinima: number;
  duracionMaxima: number;
  ubicacion: {
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    coordenadas?: { latitud: number; longitud: number };
  };
  modalidad: 'presencial' | 'remoto' | 'hibrido';
  requisitos: string[];
  habilidades: string[];
  horarios: object;
  imagenes: Array<{ url: string; public_id: string }>;
  disponible: boolean;
  proveedor: ObjectId;
  calificacionPromedio: number;
  numeroCalificaciones: number;
  numeroContrataciones: number;
  comisionPlataforma: number;
}
```

### Contratación (Hiring)
```typescript
{
  servicio: ObjectId;
  cliente: ObjectId;
  proveedor: ObjectId;
  fechaInicio: Date;
  fechaFin: Date;
  duracion: number;
  precioBase: number;
  comisionPlataforma: number;
  precioTotal: number;
  precioFinal: number;
  estado: 'pendiente' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada';
  metodoPago: string;
  pagoRealizado: boolean;
  fechaPago?: Date;
  transactionId?: string;
  notas?: string;
  calificacion?: {
    puntuacion: number;
    comentario?: string;
    fecha: Date;
  };
  historialPagos: Array<object>;
}
```

## 🔒 Seguridad

- **Autenticación JWT** con tokens seguros
- **Encriptación de contraseñas** con bcrypt
- **Rate limiting** para prevenir ataques
- **Validación de entrada** en todos los endpoints
- **Headers de seguridad** con Helmet
- **CORS** configurado apropiadamente
- **Sanitización** de datos de entrada

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rentapp
JWT_SECRET=your_super_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Alejandro** - [@alejocb96](https://github.com/alejocb96)

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, puedes:

- Abrir un [Issue](https://github.com/alejocb96/Back-end-ServiceApp/issues)
- Contactar al desarrollador

---

⭐ **¡No olvides darle una estrella al proyecto si te gusta!** ⭐
