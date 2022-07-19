import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  memos: 
    [
      {
      type: Schema.Types.ObjectId,
      ref: 'memos'
      }
    ]
})

export default mongoose.model('users', User);