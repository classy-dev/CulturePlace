import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import createHandler from "../middleware";

const tossRouter = createHandler();

function base64encode(plaintext: string) {
  return Buffer.from(plaintext, "utf8").toString("base64");
}

tossRouter.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { amount, orderId, paymentKey } = req.query;
  axios
    .post(
      `https://api.tosspayments.com/v1/payments/${paymentKey}`,
      {
        amount,
        orderId
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
    .then((response: any) => {
      console.log("response", response);
      // TODO: 구매 완료 비즈니스 로직
      return res.send(response.data);
    })
    .catch(function (error: any) {
      console.log("error", error);
      res.redirect(
        `/fail?code=${error.response?.body?.code}&message=${error.response?.body?.message}`
      );
    });
});

export default tossRouter;
