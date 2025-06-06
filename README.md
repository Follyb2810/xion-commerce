Clean Architecture Layers:
Controllers: Handle HTTP requests and responses.
Services: Business logic.
Repositories: Data access layer.
Models: MongoDB schemas.
Sockets: Real-time logic.

ecommerce-api/
├── src/
│   ├── config/               # Configuration files
│   │   └── database.js
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── chatController.js
│   ├── services/             # Business logic
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   └── chatService.js
│   ├── repositories/         # Data access layer
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── orderRepository.js
│   │   └── chatRepository.js
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   └── Chat.js
│   ├── sockets/              # Socket.IO logic
│   │   └── chatSocket.js
│   ├── middleware/           # Middleware (e.g., auth)
│   │   └── authMiddleware.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── chatRoutes.js
│   └── utils/                # Utility functions
│       └── errorHandler.js
├── .env                      # Environment variables
└── server.js                 # Entry point#   c o m m e r c e _ c o s m o s  
 #   c o s m o s _ e c o m m e r c e  
 #   c o s m o s _ e c o m m e r c e  
 #   c o s m o s _ e c o m m e r c e  
 #   x i o n - c o m m e r c e  
 