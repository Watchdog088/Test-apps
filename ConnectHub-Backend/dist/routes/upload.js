"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'File upload endpoint - to be implemented',
            data: null
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Upload service temporarily unavailable'
        });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map