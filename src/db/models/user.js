import { model, Schema } from 'mongoose';


const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true},
    articlesAmount: { type: Number, required: true},
    description: { type: String, required: true},

    email: { type: String, unique: true },
    password: { type: String},

  },
  { timestamps: true, versionKey: false },
);

usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('users', usersSchema); 