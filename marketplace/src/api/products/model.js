import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ReviewSchema = new Schema({
  comment: { type: String, required: true },
  rate: { type: Number, required: true, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});



const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  reviews: [ReviewSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model("Product", ProductSchema);
