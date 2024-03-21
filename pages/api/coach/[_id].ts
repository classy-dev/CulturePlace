import type { NextApiRequest, NextApiResponse } from "next";
import createHandler from "../middleware";
import Product from "../models/product";

const productRouter = createHandler();

// get
productRouter.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { _id } = req.query;

    const products = await Product.findOne({ _id });
    return res.send(products);
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
});

// 추가.
productRouter.patch(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { _id } = req.query;

    const products = await Product.updateOne(
      { _id },
      { $push: { coach: { ...req.body } } },
      { upsert: true }
    );
    return res.send(products);
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
});

productRouter.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { _id, coachId } = req.query;

    console.log("_id", _id, "coachId", coachId);
    const products = await Product.findByIdAndUpdate(_id, {
      $pull: { coach: { _id: coachId } }
    }).exec();
    return res.send(products);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(500).send(JSON.stringify(err));
  }
});

export default productRouter;
