"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../controllers/services");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', services_1.getServices);
router.get('/search', services_1.searchServices);
router.get('/provider/:providerId', services_1.getServicesByProvider);
router.get('/:id', services_1.getService);
router.post('/:id/calculate-price', services_1.calculateServicePrice);
router.post('/', auth_1.protect, auth_1.providerOrAdmin, services_1.createService);
router.put('/:id', auth_1.protect, auth_1.userOrAdmin, services_1.updateService);
router.delete('/:id', auth_1.protect, auth_1.userOrAdmin, services_1.deleteService);
exports.default = router;
//# sourceMappingURL=services.js.map