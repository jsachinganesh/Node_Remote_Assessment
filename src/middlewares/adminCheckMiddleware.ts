import AppError from '../utils/appError';
import Constants from '../utils/constants';
import HttpStatusCode from '../utils/StatusCodeEnum';
import catchAsync from './../utils/catchAsync';

const adminCheck = catchAsync(async (req,res,next)=>{
    if(req.headers.role != "admin"){
      return next( new AppError(Constants.ONLY_ADMINS,HttpStatusCode.Unauthorized));
    }
    next();
});

export default adminCheck;