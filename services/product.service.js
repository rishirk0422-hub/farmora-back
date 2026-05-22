import Product from "../models/Product.js";

export const createProduct = async (data, userId) => {
  return await Product.create({
    ...data,
    seller: userId,
  });
};

export const getAllProducts = async () => {
  return await Product.find().populate("seller", "fullName email");
};

export const getProductById = async (id) => {
  return await Product.findById(id).populate("seller", "fullName email");
};

export const updateProduct = async (id, data, userId) => {
  return await Product.findOneAndUpdate(
    { _id: id, seller: userId },
    data,
    { new: true }
  );
};

export const deleteProduct = async (id, userId) => {
  return await Product.findOneAndDelete({
    _id: id,
    seller: userId,
  });
};