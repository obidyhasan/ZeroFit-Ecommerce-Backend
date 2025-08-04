import { model, Schema } from "mongoose";
import { ICategory, ISubCategory } from "./category.interface";

// ---------------- sub category --------------
const subCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    thumbnail: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

subCategorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = this.name.toLowerCase().split(" ").join("-");

    let slug = baseSlug;
    let counter = 0;
    while (await SubCategory.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

subCategorySchema.pre("findOneAndUpdate", async function (next) {
  const subCategory = this.getUpdate() as Partial<ISubCategory>;

  if (subCategory.name) {
    const baseSlug = subCategory.name.toLowerCase().split(" ").join("-");

    let slug = baseSlug;
    let counter = 0;
    while (await SubCategory.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    subCategory.slug = slug;
  }

  this.setUpdate(subCategory);
  next();
});

export const SubCategory = model<ISubCategory>(
  "SubCategory",
  subCategorySchema
);

// ---------------- category --------------
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    subCategories: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
    thumbnail: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const baseSlug = this.name.toLowerCase().split(" ").join("-");

    let slug = `${baseSlug}-category`;
    let counter = 0;
    while (await Category.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

categorySchema.pre("findOneAndUpdate", async function (next) {
  const category = this.getUpdate() as Partial<ICategory>;

  if (category.name) {
    const baseSlug = category.name.toLowerCase().split(" ").join("-");

    let slug = `${baseSlug}-category`;
    let counter = 0;
    while (await Category.exists({ slug })) {
      slug = `${slug}-${counter++}`;
    }
    category.slug = slug;
  }

  this.setUpdate(category);
  next();
});

export const Category = model<ICategory>("Category", categorySchema);
