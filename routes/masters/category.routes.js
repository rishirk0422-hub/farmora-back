import express from "express";
import { pool } from "../../config/pgdb.js"
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ─── Create Table (run once on server start) ─────────────────────────────────
export const initCategoryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id                 SERIAL PRIMARY KEY,
      category_name      VARCHAR(100) NOT NULL UNIQUE,
      category_description TEXT NOT NULL,
      created_by         VARCHAR(100),
      last_modified_by   VARCHAR(100),
      created_date       TIMESTAMPTZ DEFAULT NOW(),
      last_modified_date TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log("✅ Categories table ready");
};

// ─── GET all categories ───────────────────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// ─── GET single category ──────────────────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Category not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch category" });
  }
});

// ─── POST create category ─────────────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  const { category_name, category_description } = req.body;

  if (!category_name || !category_description)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const createdBy = req.user?.fullName || req.user?.email || "System";

    const result = await pool.query(
      `INSERT INTO categories 
        (category_name, category_description, created_by, last_modified_by)
       VALUES ($1, $2, $3, $3)
       RETURNING *`,
      [category_name.trim(), category_description.trim(), createdBy]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ message: "Category name already exists" });
    console.error(err);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// ─── PUT update category ──────────────────────────────────────────────────────
router.put("/:id", protect, async (req, res) => {
  const { category_name, category_description } = req.body;

  if (!category_name || !category_description)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const modifiedBy = req.user?.fullName || req.user?.email || "System";

    const result = await pool.query(
      `UPDATE categories
       SET category_name        = $1,
           category_description = $2,
           last_modified_by     = $3,
           last_modified_date   = NOW()
       WHERE id = $4
       RETURNING *`,
      [category_name.trim(), category_description.trim(), modifiedBy, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Category not found" });

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ message: "Category name already exists" });
    console.error(err);
    res.status(500).json({ message: "Failed to update category" });
  }
});

// ─── DELETE category ──────────────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

export default router;
