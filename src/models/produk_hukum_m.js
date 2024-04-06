import { jdihdb } from "../configs/database.js";

const selectAllProdukHukum = async () => {
  const query = await jdihdb.select("*").from("produk");

  return query;
};

export { selectAllProdukHukum };
