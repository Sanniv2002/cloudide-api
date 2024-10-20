import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 50,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})