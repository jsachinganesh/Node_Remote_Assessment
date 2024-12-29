import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

// Interface for the Movie Document
interface IMovie extends Document {
  title: string;
  genre: string;
  rating: number;
  streamingLink: string;
}

// Define the Movie Schema
const movieSchema: Schema<IMovie> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A movie must have a title"],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, "A movie must have a genre"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 0"],
      max: [5, "Rating must be below or equal to 10"],
    },
    streamingLink: {
      type: String,
      maxlength:[4000,"Streaming Link max length is 4000"]
    }
  },
  {
    timestamps: true, 
  }
);

movieSchema.index({ title: 'text', genre: 'text' });

const Movie: Model<IMovie> = mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;
