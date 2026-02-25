import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    serialNo: Number,
    firstName: String,
    lastName: String,
    company: String,
    title: String,
    email: {type:String,required:true},
    phone: String,
    selectedBy: [{name:String,selected:{type:Boolean,default:false}}],  
    giftCollected: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending","scheduled", "completed", "not-available", "removed"],
      default: "pending",
      required:true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    comment:{
      type:String,
      default:""
    },
    giftBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
  },
  { timestamps: true }
);

UserSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await mongoose.model('Slot').deleteMany({ userId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.pre('deleteMany', { document: false, query: true }, async function(next) {
  try {
    const filter = this.getFilter();
    const users = await mongoose.model('UserCollection').find(filter, '_id');
    const userIds = users.map(u => u._id);
    await mongoose.model('Slot').deleteMany({ userId: { $in: userIds } });
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.pre('findOneAndDelete', async function(next) {
  try {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await mongoose.model('Slot').deleteMany({ userId: doc._id });
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const UserCollection = mongoose.model("UserCollection", UserSchema);