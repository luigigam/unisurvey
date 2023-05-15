import mongoose, { Document, Schema } from 'mongoose';

export interface Event extends Document {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
  isRegular: boolean;
}

const eventSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  isRegular: { type: Boolean, required: true },
});

export default mongoose.model<Event>('Event', eventSchema);
