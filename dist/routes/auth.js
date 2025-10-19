"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', auth_1.register);
router.post('/login', auth_1.login);
router.get('/me', auth_2.protect, auth_1.getMe);
router.put('/updatedetails', auth_2.protect, auth_1.updateDetails);
router.put('/updatepassword', auth_2.protect, auth_1.updatePassword);
router.post('/forgotpassword', auth_1.forgotPassword);
router.put('/resetpassword/:resettoken', auth_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map