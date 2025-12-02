import { Router } from "express";
import { googleLogin, oauthCallback, googleClient } from "../controllers/oauthController";

const router = Router();

router.get("/google", googleLogin);
router.get("/google/callback", oauthCallback);

export default router;
;
