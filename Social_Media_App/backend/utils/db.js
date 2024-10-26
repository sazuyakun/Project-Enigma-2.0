import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://nayakswadhin25:1111111q@cluster0.3q077.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("mongodb connected successfully.");
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
