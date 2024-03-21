import createHandler from "../middleware";
import Payment from "../models/payment";
import User from "../models/user";
import Product from "../models/product";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const handler = createHandler();

function base64encode(plaintext: string) {
  return Buffer.from(plaintext, "utf8").toString("base64");
}

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { role } = req.query;
  console.log("userid userid userid", role);
  if (role === "master") {
    const product = await Product.find().limit(1);
    const user = await User.find().limit(1);
    const result = await Payment.find()
      .populate("productId")
      .populate("userid", "name email phone")
      .sort({ _id: -1 });
    return res.status(200).json(result);
  } else {
    return res.status(200).send(null);
  }
});

handler.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const { paymentkey, coachId, productId, paymentid } = req.query;

  try {
    const searchId = await Payment.findOne({ _id: paymentid }, { userid: 1 });

    const [joinMember, productsCount, tossResult] = await Promise.all([
      Product.updateOne(
        { _id: productId },
        { $pull: { joinMembr: searchId.userid } },
        { upsert: true }
      ),
      Payment.updateOne(
        { _id: paymentid },
        { $set: { "data.status": "CANCEL" } }
      ),
      await axios.post(
        `https://api.tosspayments.com/v1/payments/${paymentkey}/cancel`,
        {
          cancelReason: "고객이 취소를 원함"
        },
        {
          headers: {
            Authorization: `Basic ${base64encode(
              `${process.env.TOSS_SECRET_KEY}:`
            )}`,
            "Content-Type": "application/json"
          }
        }
      )
    ]);

    if (coachId) {
      const coachs = await Product.updateOne(
        {
          _id: productId
        },
        {
          $pull: {
            "coach.$[].register": {
              //$[] does the trick
              paymentid: {
                $in: [paymentid]
              }
            }
          }
        }
      );
    }

    return res.status(200).json({ msg: "success" });
  } catch (e) {
    console.log(e);
  }
});

export default handler;
