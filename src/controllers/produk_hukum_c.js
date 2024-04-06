import { selectAllProdukHukum } from "../models/produk_hukum_m.js";

const getProdukHukum = async (req, res) => {
  const data = await selectAllProdukHukum();

  res.status(200).json({
    message: "Success",
    data: data
  });
};

export { getProdukHukum };
