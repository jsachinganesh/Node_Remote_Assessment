import catchAsync from './../utils/catchAsync';
import Movie from '../models/Movie';
import IMovie from '../interfaces/IMovie';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { Types } from 'mongoose';
import Constants from '../utils/constants';
import HttpStatusCode from '../utils/StatusCodeEnum';

class MovieController {
  private static instance: MovieController;

  private constructor() {}

  public static getInstance(): MovieController {
    if (!MovieController.instance) {
      MovieController.instance = new MovieController();
    }
    return MovieController.instance;
  }

  // Get movies, with optional search query
  public getMovies = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;

    let movies;
    
    // Handle search query or return all movies
    if (q) {
      movies = await this.searchMovies(q as string);
    } else {
      movies = await this.getAllMovies();
    }

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      results: movies.length,
      data: movies,
    });
  });

  // Create a new movie
  public createMovie = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { genre, rating, streamingLink, title } = req.body;

    // Validate input
    if (!title || !genre) {
      return next(new AppError(Constants.MISSING_REQ_FIELDS,  HttpStatusCode.BadRequest));
    }

    const newMovie: IMovie = { genre, rating, streamingLink, title };
    const data = await Movie.create(newMovie);

    res.status(HttpStatusCode.Created).json({
      status: 'success',
      data,
    });
  });

  // Update a movie by ID
  public updateMovie = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, genre, rating, streamingLink } = req.body;

    // Validate the movie ID
    if (!Types.ObjectId.isValid(id)) {
      return next(new AppError(Constants.INVAILD_ID_FORMAT, HttpStatusCode.BadRequest));
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { title, genre, rating, streamingLink },
      { new: true, runValidators: true, select: '-createdAt -updatedAt -__v' }
    );

    if (!updatedMovie) {
      return next(new AppError(Constants.NO_MOVIE_FOUND_ID, HttpStatusCode.NotFound));
    }

    res.status(HttpStatusCode.OK).json({
      status: 'success',
      data: updatedMovie,
    });
  });

  // Delete a movie by ID
  public deleteMovie = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validate the movie ID
    if (!Types.ObjectId.isValid(id)) {
      return next(new AppError(Constants.INVAILD_ID_FORMAT, HttpStatusCode.BadRequest));
    }

    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
      return next(new AppError(Constants.NO_MOVIE_FOUND_ID, HttpStatusCode.NotFound));
    }

    res.status(HttpStatusCode.NoContent).json({
      status: 'success',
      data: null,
    });
  });

  // Search for movies using a query
  private async searchMovies(query: string): Promise<any> {
    return Movie.aggregate([
      { $match: { $text: { $search: query } } },
      {
        $project: {
          id: { $toString: '$_id' },
          title: 1,
          genre: 1,
          rating: 1,
          streamingLink: 1,
          _id: 0,
        },
      },
    ]);
  }

  private async getAllMovies(): Promise<any> {
    return Movie.aggregate([
      {
        $project: {
          id: { $toString: '$_id' },
          title: 1,
          genre: 1,
          rating: 1,
          streamingLink: 1,
          _id: 0,
        },
      },
    ]);
  }
}

export default MovieController;
