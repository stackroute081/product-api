const express = require("express");
const { products, getNextId } = require("../data/products");
const { sendSuccess, sendError } = require("../utils/response");

const router = express.Router();

// GET /products - List all products
router.get("/", function (req, res) {
  return sendSuccess(res, 200, products);
});

// GET /products/:id - Get a single product
router.get("/:id", function (req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return sendError(res, 400, "INVALID_ID", "id must be a number");
  }

  const product = products.find(function (item) {
    return item.id === id;
  });
  if (!product) {
    return sendError(res, 404, "NOT_FOUND", "Product " + id + " not found");
  }

  return sendSuccess(res, 200, product);
});

// PUT /products/:id - Update a product
router.put("/:id", function (req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return sendError(res, 400, "INVALID_ID", "id must be a number");
  }

  const product = products.find(function (item) {
    return item.id === id;
  });
  if (!product) {
    return sendError(res, 404, "NOT_FOUND", "Product " + id + " not found");
  }

  const body = req.body || {};
  const name = body.name;
  const price = body.price;

  if (typeof name !== "string" || name.trim() === "") {
    return sendError(res, 400, "VALIDATION_ERROR", "name is required");
  }
  if (typeof price !== "number" || price <= 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "price must be a positive number");
  }

  product.name = name.trim();
  product.price = price;

  return sendSuccess(res, 200, product);
});

// POST /products - Create a product
router.post("/", function (req, res) {
  const body = req.body || {};
  const name = body.name;
  const price = body.price;

  if (typeof name !== "string" || name.trim() === "") {
    return sendError(res, 400, "VALIDATION_ERROR", "name is required");
  }
  if (typeof price !== "number" || price <= 0) {
    return sendError(res, 400, "VALIDATION_ERROR", "price must be a positive number");
  }

  const product = { id: getNextId(), name: name.trim(), price: price };
  products.push(product);

  return sendSuccess(res, 201, product);
});

module.exports = router;