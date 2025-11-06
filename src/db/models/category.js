import { model, Schema } from 'mongoose';

const categoriesSchema = new Schema(
  {
    name: { 
        type: String, 
        required: true},
  },
  { timestamps: true,
    versionKey: false,
   }
);

categoriesSchema.index({ name: 1 }, { unique: true, collation: { locale: 'uk', strength: 2 } });

export const CategoriesSchema = model('categories', categoriesSchema);