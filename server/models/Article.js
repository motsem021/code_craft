import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    content: { type: String, required: true },
    audioPath: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    embedding: { type: [Number], default: [] }, 
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
