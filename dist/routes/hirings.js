"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hirings_1 = require("../controllers/hirings");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/my', hirings_1.getMyHirings);
router.post('/', hirings_1.createHiring);
router.get('/:id', hirings_1.getHiring);
router.put('/:id/status', hirings_1.updateHiringStatus);
router.post('/:id/payment', hirings_1.addPayment);
router.post('/:id/rate', hirings_1.rateHiring);
router.get('/', auth_1.admin, hirings_1.getHirings);
exports.default = router;
//# sourceMappingURL=hirings.js.map