import { Router } from 'express';
import { upsertUser } from '../utils/db';


const router = Router();

router.patch("/update", async (req: any, res: any) => {
    try {
        const { email, institution_type, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email and name are required." });
        }

        const result = await upsertUser({ email, name, institution_type });

        if (result.success) {
            return res.status(200).json({ message: "User upserted successfully", user: result.data });
        } else {
            return res.status(500).json({ message: "Failed to upsert user", error: result.message });
        }
    } catch (error) {
        console.error("Error in /update route:", error);
        return res.status(500).json({ message: "Server error", error });
    }
});

export default router;