import express from "express";
import MovieController from './../controllers/movieController';
import adminCheck from "../middlewares/adminCheckMiddleware";

const router = express.Router();

const movieController = MovieController.getInstance();

router.post("/",adminCheck,movieController.createMovie);
router.put("/:id",adminCheck,movieController.updateMovie);
router.delete('/:id',adminCheck,movieController.deleteMovie);
router.get('/', movieController.getMovies);

export default router;