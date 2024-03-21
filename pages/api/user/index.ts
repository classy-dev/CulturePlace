import createHandler from "../middleware";
import User from "../models/user";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = createHandler();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const result = await User.find({}, { userpwd: false, salt: false });
  return res.status(200).json(result);
});

// handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     const user = new User(req.body);
//     await user.save();
//     return res.send(user);
//   } catch (err) {
//     console.log(JSON.stringify(err));
//     res.status(500).send(JSON.stringify(err));
//   }
// });

handler.patch(async (req: NextApiRequest, res: NextApiResponse) => {
  const { _id, role } = req.query;
  console.log(req.query);
  const result = await User.updateOne({ _id }, { $set: { role } });
  return res.status(200).json({ msg: "ok" });
});

export default handler;
