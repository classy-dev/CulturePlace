import createHandler from "../middleware";
import User from "../models/user";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = createHandler();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { _id } = req.query;
    const users = await User.findOne({ _id });
    return res.send(users);
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
});

handler.put(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { _id } = req.query;
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true
    });
    return res.send(user);
  } catch (err) {
    console.log(JSON.stringify(err));
    res.status(500).send(JSON.stringify(err));
  }
});

export default handler;
