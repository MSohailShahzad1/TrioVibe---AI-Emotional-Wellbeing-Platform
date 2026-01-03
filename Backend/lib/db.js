import mongoose from"mongoose";

export const ConnectDB= async()=>{
    try {
        mongoose.connection.on('connected',()=>{console.log("DataBase Connected")})
        await mongoose.connect(`${process.env.MONGODB_URI}/TRIO-VIBE`)
    } catch (error) {
        console.log(error);
    }
}
