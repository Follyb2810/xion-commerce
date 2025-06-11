chatHistory: [{ type: Schema.Types.ObjectId, ref: 'Chat' }]
import mongoose, { Schema, Document } from 'mongoose';

interface IMessage {
    sender: string; 
    receiver: string; 
    message: string;
    timestamp: Date;
}

interface IChat extends Document {
    users: string[]; 
    messages: IMessage[];
}

const chatSchema: Schema = new Schema<IChat>(
    {
        users: [{ type: String, required: true }], 
        messages: [
            {
                sender: { type: String, required: true },
                receiver: { type: String, required: true },
                message: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model<IChat>('Chat', chatSchema);

