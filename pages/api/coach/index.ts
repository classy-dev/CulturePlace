import createHandler from "../middleware";
import Coach from "../models/coach";
import type { NextApiRequest, NextApiResponse } from "next";

const coachRouter = createHandler();

coachRouter.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const coachs = new Coach(req.body);
    await coachs.save();
    return res.send(coachs);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

export default coachRouter;
