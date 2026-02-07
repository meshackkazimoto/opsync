export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Opsync API",
    version: "1.0.0",
    description: "API documentation for Opsync",
  },
  servers: [
    { url: "http://localhost:5055" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        security: [],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" },
                },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" },
                },
                required: ["refreshToken"],
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/employees": {
      get: {
        tags: ["Employees"],
        summary: "List employees",
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Employees"],
        summary: "Create employee",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/employees/{id}": {
      get: {
        tags: ["Employees"],
        summary: "Get employee",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Employees"],
        summary: "Update employee",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Employees"],
        summary: "Delete employee",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/departments": {
      get: {
        tags: ["Employees"],
        summary: "List departments",
        parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Employees"],
        summary: "Create department",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/departments/{id}": {
      put: {
        tags: ["Employees"],
        summary: "Update department",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Employees"],
        summary: "Delete department",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/employee-roles": {
      get: {
        tags: ["Employees"],
        summary: "List employee roles",
        parameters: [{ name: "q", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Employees"],
        summary: "Create employee role",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/employee-roles/{id}": {
      put: {
        tags: ["Employees"],
        summary: "Update employee role",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Employees"],
        summary: "Delete employee role",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/sales/customers": {
      get: {
        tags: ["Sales"],
        summary: "List customers",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create customer",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/sales/customers/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Sales"],
        summary: "Update customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Sales"],
        summary: "Delete customer",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/sales/items": {
      get: {
        tags: ["Sales"],
        summary: "List items",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create item",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/sales/items/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get item",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Sales"],
        summary: "Update item",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Sales"],
        summary: "Delete item",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/sales/invoices": {
      get: {
        tags: ["Sales"],
        summary: "List invoices",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "customerId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create invoice",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/sales/invoices/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get invoice",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Sales"],
        summary: "Update invoice",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/sales/invoices/{id}/issue": {
      post: {
        tags: ["Sales"],
        summary: "Issue invoice",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/sales/invoices/{id}/void": {
      post: {
        tags: ["Sales"],
        summary: "Void invoice",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/sales/invoices/{id}/payments": {
      get: {
        tags: ["Sales"],
        summary: "List invoice payments",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Sales"],
        summary: "Create payment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/sales/invoices/{id}/pdf": {
      get: {
        tags: ["Sales"],
        summary: "Invoice PDF placeholder",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/purchasing/suppliers": {
      get: {
        tags: ["Purchasing"],
        summary: "List suppliers",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Purchasing"],
        summary: "Create supplier",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/purchasing/suppliers/{id}": {
      get: {
        tags: ["Purchasing"],
        summary: "Get supplier",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Purchasing"],
        summary: "Update supplier",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Purchasing"],
        summary: "Delete supplier",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/purchasing/purchase-orders": {
      get: {
        tags: ["Purchasing"],
        summary: "List purchase orders",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "supplierId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Purchasing"],
        summary: "Create purchase order",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/purchasing/purchase-orders/{id}": {
      get: {
        tags: ["Purchasing"],
        summary: "Get purchase order",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Purchasing"],
        summary: "Update purchase order",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/purchasing/purchase-orders/{id}/approve": {
      post: {
        tags: ["Purchasing"],
        summary: "Approve purchase order",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/purchasing/purchase-orders/{id}/receive": {
      post: {
        tags: ["Purchasing"],
        summary: "Receive purchase order",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/expenses/categories": {
      get: {
        tags: ["Expenses"],
        summary: "List expense categories",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Expenses"],
        summary: "Create expense category",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/expenses": {
      get: {
        tags: ["Expenses"],
        summary: "List expenses",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
          { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "supplierId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Expenses"],
        summary: "Create expense",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/expenses/{id}": {
      get: {
        tags: ["Expenses"],
        summary: "Get expense",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
      put: {
        tags: ["Expenses"],
        summary: "Update expense",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        tags: ["Expenses"],
        summary: "Delete expense",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/reports/overview": {
      get: {
        tags: ["Reports"],
        summary: "Overview report",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/reports/sales": {
      get: {
        tags: ["Reports"],
        summary: "Sales report",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/reports/expenses": {
      get: {
        tags: ["Reports"],
        summary: "Expenses report",
        parameters: [
          { name: "dateFrom", in: "query", schema: { type: "string" } },
          { name: "dateTo", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
  },
} as const;
