import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    content: { type: String, required: true },

    // Instead of audioPath, we store the audio as binary (Buffer)
    audioData: { type: Buffer }, 
    audioContentType: { type: String, default: "audio/mpeg" }, 

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    embedding: { type: [Number], default: [] }, 
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
