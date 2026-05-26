import express from "express";
import { pool } from "../config/pgdb.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

export const initUnitTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS units (
      id                 SERIAL PRIMARY KEY,
      unit_name          VARCHAR(100) NOT NULL UNIQUE,
      unit_symbol        VARCHAR(20)  NOT NULL UNIQUE,
      unit_description   TEXT         NOT NULL,
      created_by         VARCHAR(100),
      last_modified_by   VARCHAR(100),
      created_date       TIMESTAMPTZ  DEFAULT NOW(),
      last_modified_date TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
  console.log("✅ Units table ready");
};

// GET all
router.get("/", protect, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM units ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch units" });
  }
});

// GET one
router.get("/:id", protect, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM units WHERE id = $1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Unit not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch unit" });
  }
});

// POST
router.post("/", protect, async (req, res) => {
  const { unit_name, unit_symbol, unit_description } = req.body;
  if (!unit_name || !unit_symbol || !unit_description)
    return res.status(400).json({ message: "All fields are required" });
  try {
    const createdBy = req.user?.fullName || req.user?.email || "System";
    const result = await pool.query(
      `INSERT INTO units (unit_name, unit_symbol, unit_description, created_by, last_modified_by)
       VALUES ($1, $2, $3, $4, $4) RETURNING *`,
      [unit_name.trim(), unit_symbol.trim(), unit_description.trim(), createdBy]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Unit name or symbol already exists" });
    console.error(err);
    res.status(500).json({ message: "Failed to create unit" });
  }
});

// PUT
router.put("/:id", protect, async (req, res) => {
  const { unit_name, unit_symbol, unit_description } = req.body;
  if (!unit_name || !unit_symbol || !unit_description)
    return res.status(400).json({ message: "All fields are required" });
  try {
    const modifiedBy = req.user?.fullName || req.user?.email || "System";
    const result = await pool.query(
      `UPDATE units
       SET unit_name = $1, unit_symbol = $2, unit_description = $3,
           last_modified_by = $4, last_modified_date = NOW()
       WHERE id = $5 RETURNING *`,
      [unit_name.trim(), unit_symbol.trim(), unit_description.trim(), modifiedBy, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Unit not found" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Unit name or symbol already exists" });
    console.error(err);
    res.status(500).json({ message: "Failed to update unit" });
  }
});

// DELETE
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM units WHERE id = $1 RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Unit not found" });
    res.json({ message: "Unit deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete unit" });
  }
});

export default router;
