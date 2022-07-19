import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Memo = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectID,
    ref: 'users',
    required: true
  },
}, { timestamps: true });

export default mongoose.model('memos', Memo);