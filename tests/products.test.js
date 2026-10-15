const request = require("supertest");
const app = require("../src/app");
const { resetData } = require("../src/data/products");

beforeEach(function () {
  resetData();
});

describe("GET /products", function () {
  test("returns 200 and all products", async function () {
    // Arrange - seed data loaded by resetData()

    // Act
    const response = await request(app).get("/products");

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
  });
});

describe("GET /products/:id", function () {
  test("returns 200 and the product when id exists", async function () {
    // Act
    const response = await request(app).get("/products/1");

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Laptop");
  });

  test("returns 404 when product does not exist", async function () {
    // Act
    const response = await request(app).get("/products/99");

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  test("returns 400 when id is not a number", async function () {
    // Act
    const response = await request(app).get("/products/abc");

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_ID");
  });
});

describe("DELETE /products/:id", function () {
  test("returns the deleted product and removes it from the catalog", async function () {
    // Arrange - product with id 1 exists in seed data

    // Act
    const response = await request(app).delete("/products/1");
    const productCheck = await request(app).get("/products/1");
    const listCheck = await request(app).get("/products");

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ id: 1, name: "Laptop", price: 75000 });
    expect(productCheck.status).toBe(404);
    expect(listCheck.status).toBe(200);
    expect(listCheck.body.data).toHaveLength(1);
    expect(listCheck.body.data.some(function (product) {
      return product.id === 1;
    })).toBe(false);
  });

  test("returns 404 when product does not exist", async function () {
    // Arrange - product with id 99 does not exist

    // Act
    const response = await request(app).delete("/products/99");

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  test("returns 400 when id is not a number", async function () {
    // Arrange - id is not numeric

    // Act
    const response = await request(app).delete("/products/abc");

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_ID");
  });
});

describe("PUT /products/:id", function () {
  test("returns 200 and updates the product", async function () {
    // Arrange - product with id 1 exists in seed data

    // Act
    const response = await request(app)
      .put("/products/1")
      .send({ name: "Updated Laptop", price: 82000 });
    const check = await request(app).get("/products/1");

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ id: 1, name: "Updated Laptop", price: 82000 });
    expect(check.status).toBe(200);
    expect(check.body.data.name).toBe("Updated Laptop");
    expect(check.body.data.price).toBe(82000);
  });

  test("returns 400 when id is not a number", async function () {
    // Arrange - id is not numeric

    // Act
    const response = await request(app)
      .put("/products/abc")
      .send({ name: "Updated Laptop", price: 82000 });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_ID");
  });

  test("returns 404 when product does not exist", async function () {
    // Arrange - product with id 99 does not exist

    // Act
    const response = await request(app)
      .put("/products/99")
      .send({ name: "Updated Laptop", price: 82000 });

    // Assert
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  test("returns 400 when name is invalid", async function () {
    // Arrange - name is empty

    // Act
    const response = await request(app)
      .put("/products/1")
      .send({ name: " ", price: 82000 });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("returns 400 when price is invalid", async function () {
    // Arrange - price is not positive

    // Act
    const response = await request(app)
      .put("/products/1")
      .send({ name: "Updated Laptop", price: 0 });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});