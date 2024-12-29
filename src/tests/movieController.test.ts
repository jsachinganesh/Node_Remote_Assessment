import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import MovieController from '../controllers/movieController';
import Movie from '../models/Movie';
import errorMiddleware from '../middlewares/errorMiddleware';
import adminCheck from '../middlewares/adminCheckMiddleware';
import Constants from '../utils/constants';

const app = express();
app.use(express.json());

const movieController = MovieController.getInstance();

app.get('/movies', movieController.getMovies);
app.post('/movies', adminCheck,movieController.createMovie);
app.put('/movies/:id',adminCheck, movieController.updateMovie);
app.delete('/movies/:id',adminCheck, movieController.deleteMovie);

app.use(errorMiddleware); 

describe('MovieController', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Movie.deleteMany();
  });

  describe('GET /movies', () => {
    it('should return all movies when no query is provided', async () => {
      await Movie.insertMany([
        { title: 'Movie 1', genre: 'Action', rating: 5, streamingLink: 'link1.com' },
        { title: 'Movie 2', genre: 'Comedy', rating: 4, streamingLink: 'link2.com' },
      ]);

      const response = await request(app).get('/movies');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return filtered movies when query is provided', async () => {
      await Movie.insertMany([
        { title: 'Movie 1', genre: 'Action', rating: 5, streamingLink: 'link1.com' },
        { title: 'Movie 2', genre: 'Comedy', rating: 4, streamingLink: 'link2.com' },
      ]);

      const response = await request(app).get('/movies?q=Action');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(1);
      expect(response.body.data[0].genre).toBe('Action');
    });
  });

  describe('POST /movies', () => {
    it('should create a new movie', async () => {
      const response = await request(app).post('/movies').set('role', 'admin').send({
        title: 'New Movie',
        genre: 'Action',
        rating: 5,
        streamingLink: 'link.com',
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('New Movie');

      const createdMovie = await Movie.findOne({ title: 'New Movie' });
      expect(createdMovie).not.toBeNull();
    });
  });

  describe('POST /movies', () => {
    it('should return error if not admin', async () => {
      const response = await request(app).post('/movies').send({
        title: 'New Movie',
        genre: 'Action',
        rating: 5,
        streamingLink: 'link.com',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(Constants.ONLY_ADMINS);
    });
  });

  describe('PUT /movies/:id', () => {
    it('should update a movie', async () => {
      const movie = await Movie.create({
        title: 'Old Movie',
        genre: 'Drama',
        rating: 3,
        streamingLink: 'oldlink.com',
      });

      const response = await request(app).put(`/movies/${movie._id}`).set('role', 'admin').send({
        title: 'Updated Movie',
        genre: 'Action',
        rating: 4,
        streamingLink: 'newlink.com',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe('Updated Movie');

      const updatedMovie = await Movie.findById(movie._id);
      expect(updatedMovie?.title).toBe('Updated Movie');
    });

    it('should return error if movie not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/movies/${nonExistentId}`).set('role', 'admin').send({
        title: 'Updated Movie',
        genre: 'Action',
        rating: 4,
        streamingLink: 'newlink.com',
      });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
    });
  });

  describe('DELETE /movies/:id', () => {
    it('should delete a movie', async () => {
      const movie = await Movie.create({
        title: 'Movie to Delete',
        genre: 'Drama',
        rating: 3,
        streamingLink: 'link.com',
      });

      const response = await request(app).delete(`/movies/${movie._id}`).set('role', 'admin');

      expect(response.status).toBe(204);

      const deletedMovie = await Movie.findById(movie._id);
      expect(deletedMovie).toBeNull();
    });

    it('should return error if movie not found for deletion', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/movies/${nonExistentId}`).set('role', 'admin');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No movie found with that ID');
    });

    it('should return error if not admin', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/movies/${nonExistentId}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(Constants.ONLY_ADMINS);
    });
  });
});
