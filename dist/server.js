"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
require("express-async-errors");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const notFound_1 = require("./middleware/notFound");
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const users_1 = __importDefault(require("./routes/users"));
const hirings_1 = __importDefault(require("./routes/hirings"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, database_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.'
    }
});
app.use(limiter);
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/auth', auth_1.default);
app.use('/api/services', services_1.default);
app.use('/api/users', users_1.default);
app.use('/api/hirings', hirings_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RentApp API está funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bienvenido a RentApp API',
        version: process.env.npm_package_version || '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            services: '/api/services',
            users: '/api/users',
            hirings: '/api/hirings',
            health: '/api/health'
        }
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.default);
const PORT = parseInt(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map