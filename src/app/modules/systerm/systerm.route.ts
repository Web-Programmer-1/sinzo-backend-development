import express from "express";
import { runCleanup } from "./systrem.controller";

const router = express.Router();

router.post("/cleanup", runCleanup);

export const SystemRoutes = router;