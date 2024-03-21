import mongoose, { Schema } from "mongoose";

const MODEL_NAME = "Product";

//  코치신청자
const registerSchema = new mongoose.Schema(
  {
    userinfo: mongoose.Schema.Types.Mixed,
    paymentid: String
  },
  {
    timestamps: true
  }
);

// 코치
const coachSchema = new mongoose.Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  maxLimit: Number,
  startTime: String,
  endTime: String,
  price: Number,
  register: [registerSchema]
});

// 코치 신청 고객

// VOD 커리큘럼, 레슨
const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true
    },
    content: {
      type: String,
      minlength: 200
    },
    mediaId: { type: String },
    mediaTime: { type: Number },
    filename: { type: String }
  },
  { timestamps: true }
);

const curriculumSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema]
});

const ProductSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    imgurl: { type: String },
    title: { type: String, required: true },
    people: { type: String, required: true },
    genre: { type: String, required: true },
    meettype: { type: String, requierd: true, default: "one" },
    location: { type: String },
    meetday: { type: String },
    maxlimit: { type: Number },
    onoff: { type: String },
    firstmeet: { type: Date },
    body: { type: String, required: true },
    price: { type: Number, default: 0 },
    saleprice: { type: Number, default: 0 },
    isvod: { type: Boolean, required: true, default: false },
    islive: { type: Boolean, required: true, default: false },
    joinMembr: [{ type: Schema.Types.ObjectId, ref: "User" }],
    favoriteduser: [{ type: Schema.Types.ObjectId, ref: "User" }],
    curriculum: [curriculumSchema],
    coach: [coachSchema]
    // lessons: [lessonSchema]
  },
  {
    timestamps: true
  }
);

// ProductSchema.virtual("reviews", {
//   ref: "Review",
//   localField: "_id",
//   foreignField: "product"
// });

// ProductSchema.set("toObject", { virtuals: true });
// ProductSchema.set("toJSON", { virtuals: true });

export default mongoose.models[MODEL_NAME] ||
  mongoose.model(MODEL_NAME, ProductSchema, "products");
