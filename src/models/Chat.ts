import mongoose,{Schema, Types} from "mongoose";
import { IChatMessage } from "../types/IChatMessage";


const chatSchema = new Schema<IChatMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, 
})

export default  mongoose.models.Chat|| mongoose.model<IChatMessage>("Chat",chatSchema)