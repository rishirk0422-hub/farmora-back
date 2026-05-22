import asyncHandler from "express-async-handler";
import Product from "../models/Product.model.js";
import cloudinary from "../config/cloudinary.js";


export const createProduct = async (req, res) => {
  try {
    console.log("USER:", req.user);
    console.log("BODY:", req.body);

    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: file.path, 
        public_id: file.filename,
      }));
    }

    const product = await Product.create({
      ...req.body,
      seller: req.user._id,
      images: images,
    });

    res.status(201).json(product);

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate("seller", "fullName address") 
    .sort({ createdAt: -1 });
console.log("The products for the get request ar5e :",products)
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("seller");
  res.json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw new Error("Product not found");

  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  Object.assign(product, req.body);
  await product.save();

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw new Error("Product not found");

  await product.deleteOne();
  res.json({ message: "Product deleted" });
});