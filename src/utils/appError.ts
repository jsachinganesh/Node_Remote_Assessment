class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;
  
    constructor(message: string, statusCode: number) {
      super(message);
  
      this.statusCode = statusCode;
      this.status = 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default AppError;
  