### v2

### Moving to modular monolith

# Controller Layer:this layer handles HTTP concerns and delegates to services

- user.controller.ts

# dto : data transfer objectt

- user.dto.ts

# dto : Database Schema

- user.model.ts

# Service Layer: Contains all business logic, validation, and orchestration

- user.service.ts

# dto : Routes

- user.routes.ts

# dto : Mapping

- user.mapper.ts

## Repository Layer: Pure data access, no business logic

- user.repository.ts

### Clean Architecture Layers:

### Controllers: Handle HTTP requests and responses.

### Services: Business logic.

### Repositories: Data access layer.

### Models: MongoDB schemas.

### Sockets: Real-time logic.

### v1
xion-api/
├── src/
│ ├── config/ # Configuration files
│ │ └── database.js
│ ├── controllers/ # Request handlers
│ │ ├── authController.js
│ │ ├── userController.js
│ │ ├── productController.js
│ │ ├── orderController.js
│ │ └── chatController.js
│ ├── services/ # Business logic
│ │ ├── authService.js
│ │ ├── userService.js
│ │ ├── productService.js
│ │ ├── orderService.js
│ │ ├── paymentService.js
│ │ └── chatService.js
│ ├── repositories/ # Data access layer
│ │ ├── userRepository.js
│ │ ├── productRepository.js
│ │ ├── orderRepository.js
│ │ └── chatRepository.js
│ ├── models/ # MongoDB schemas
│ │ ├── User.js
│ │ ├── Product.js
│ │ ├── Category.js
│ │ ├── Order.js
│ │ └── Chat.js
│ ├── sockets/ # Socket.IO logic
│ │ └── chatSocket.js
│ ├── middleware/ # Middleware (e.g., auth)
│ │ └── authMiddleware.js
│ ├── routes/ # API routes
│ │ ├── authRoutes.js
│ │ ├── userRoutes.js
│ │ ├── productRoutes.js
│ │ ├── orderRoutes.js
│ │ └── chatRoutes.js
│ └── utils/ # Utility functions
│ └── errorHandler.js
├── .env # Environment variables
└── app.js # Entry point
