import express from "express";
import { getProdukHukum } from "../controllers/produk_hukum_c.js";

const produkHukumRouter = express.Router();

produkHukumRouter.get("/", getProdukHukum);

export default produkHukumRouter;
