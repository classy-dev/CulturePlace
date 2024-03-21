import mongoose, { Schema } from "mongoose";

const MODEL_NAME = "Payment";

const schema = new Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    coachId: String
  },
  {
    timestamps: true
  }
);

export default mongoose.models[MODEL_NAME] ||
  mongoose.model(MODEL_NAME, schema, "payments");
