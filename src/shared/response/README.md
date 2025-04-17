# Consistent API Response Format

This project implements a consistent API response format inspired by NestJS, with proper separation of concerns between error handling and successful responses.

## Response Format

### Success Responses

All successful API responses follow this format:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    /* Your returned data */
  },
  "meta": {
    /* Optional metadata */
  }
}
```

### Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Detailed error description"
}
```

## How to Use

### 1. Controller Methods

Return data directly from your controller methods:

```typescript
async login(req: Request): Promise<ControllerResult> {
  const result = await authService.login(req.body);
  return {
    data: result,
    message: "Login successful",
    statusCode: StatusCodes.OK
  };
}
```

The `ControllerResult` interface allows you to specify:

- `data`: The main response data
- `message`: A custom message
- `statusCode`: HTTP status code
- `meta`: Optional metadata

### 2. Route Setup

Use the `interceptController` utility to wrap your controller:

```typescript
// Intercept all controller methods
const interceptedController = interceptController(authController);

// Use the intercepted methods in your routes
router.post("/login", validate(loginDtoSchema), interceptedController.login);
```

Or intercept individual methods:

```typescript
router.post(
  "/login",
  validate(loginDtoSchema),
  intercept(authController.login.bind(authController))
);
```

### 3. Global Response Interceptor

The system includes a global response interceptor that automatically formats all JSON responses. This is already set up in the Express server:

```typescript
app.use(responseInterceptor());
```

### 4. Error Handling

The error handler is separate from the response interceptor but produces responses in a compatible format.

To throw an error from your controller or service:

```typescript
throw new AppError(StatusCodes.BAD_REQUEST, "Invalid credentials");
```

For convenience, the `AppError` class includes static methods:

```typescript
throw AppError.badRequest("Invalid email format");
```

## Examples

### Controller Example

```typescript
import { ControllerResult } from "@/shared/interceptors/response.interceptor";

async register(req: Request): Promise<ControllerResult> {
  const userData = req.body;

  // Service may throw errors
  const result = await userService.createUser(userData);

  // Return successful response
  return {
    data: result,
    message: "User registered successfully",
    statusCode: StatusCodes.CREATED
  };
}
```

### Error Handling Example

```typescript
// In a service
async createUser(userData: CreateUserDto): Promise<User> {
  const existingUser = await this.userRepository.findByEmail(userData.email);

  if (existingUser) {
    throw AppError.conflict("Email already in use");
  }

  return this.userRepository.create(userData);
}
```
