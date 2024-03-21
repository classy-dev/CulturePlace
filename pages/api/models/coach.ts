import mongoose, { Schema } from "mongoose";

const MODEL_NAME = "Coach";

const CoachSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    maxLimit: Number,
    startTime: String,
    endTime: String,
    price: Number,
    register: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true
  }
);

export default mongoose.models[MODEL_NAME] ||
  mongoose.model(MODEL_NAME, CoachSchema, "coachs");
