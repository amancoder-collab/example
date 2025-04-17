import { Router } from "express";
import { lookupCertification } from "../controllers/certification.controller";
import { validate } from "@/shared/validators/global.validator";
import { certNumberSchema } from "../validators/certification.validator";

const router = Router();

router.get(
  "/lookup/:certNumber",
  validate(certNumberSchema, { source: "params" }),
  lookupCertification
);

export default router;
