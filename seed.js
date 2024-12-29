import mongoose from 'mongoose';

const seedMovies = async () => {
  const movies = [
    {
      title: 'Cat vs Dog',
      genre: 'Horror',
      rating: 5,
      streamingLink: '',
    },
    {
      title: 'Space Adventure',
      genre: 'Sci-Fi',
      rating: 4,
      streamingLink: 'https://example.com/space-adventure',
    },
    {
      title: 'Comedy Night',
      genre: 'Comedy',
      rating: 3,
      streamingLink: 'https://example.com/comedy-night',
    },
    {
      title: 'Romantic Escape',
      genre: 'Romance',
      rating: 4,
      streamingLink: '',
    },
    {
      title: 'Action Blast',
      genre: 'Action',
      rating: 4.5,
      streamingLink: 'https://example.com/action-blast',
    },
    {
      title: 'Mystery of the Lake',
      genre: 'Mystery',
      rating: 4,
      streamingLink: '',
    },
  ];

  try {
    await mongoose.connect('mongodb://localhost:27017/lobby', { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection;
    const collection = db.collection('movies');
    await collection.deleteMany({});
    await collection.insertMany(movies);

    console.log('Seed data successfully added');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding data:', err);
    mongoose.disconnect();
  }
};

seedMovies();
