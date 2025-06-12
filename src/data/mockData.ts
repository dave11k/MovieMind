import { Movie } from '../types/Movie';
export const mockMovies: Movie[] = [{
  id: 1,
  title: 'The Dark Knight',
  year: 2008,
  description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  rating: 9.0,
  genre: 'Action'
}, {
  id: 2,
  title: 'Inception',
  year: 2010,
  description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  rating: 8.8,
  genre: 'Sci-Fi'
}, {
  id: 3,
  title: 'Pulp Fiction',
  year: 1994,
  description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
  posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  rating: 8.9,
  genre: 'Crime'
}, {
  id: 4,
  title: 'The Shawshank Redemption',
  year: 1994,
  description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80',
  rating: 9.3,
  genre: 'Drama'
}, {
  id: 5,
  title: 'The Godfather',
  year: 1972,
  description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
  posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  rating: 9.2,
  genre: 'Crime'
}, {
  id: 6,
  title: 'Interstellar',
  year: 2014,
  description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1194&q=80',
  rating: 8.6,
  genre: 'Sci-Fi'
}];
export const mockRecommendations: Movie[] = [{
  id: 101,
  title: 'Quantum Horizon',
  year: 2025,
  description: 'A physicist discovers a way to communicate across parallel universes, only to find a version of herself planning to destroy our reality.',
  posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80',
  rating: 8.7,
  genre: 'Sci-Fi'
}, {
  id: 102,
  title: 'The Last Memory',
  year: 2024,
  description: "In a world where memories can be traded as currency, a detective must solve a murder where the killer erased all witnesses' memories.",
  posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1159&q=80',
  rating: 8.5,
  genre: 'Thriller'
}, {
  id: 103,
  title: 'Neon Dynasty',
  year: 2026,
  description: 'A cybernetic enforcer questions her loyalty when she discovers her memories were implanted and her targets may be innocent.',
  posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
  rating: 9.1,
  genre: 'Action'
}, {
  id: 104,
  title: 'Echoes of Eternity',
  year: 2024,
  description: 'An archaeologist discovers an ancient civilization with technology that can manipulate time, changing the course of human history.',
  posterUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1153&q=80',
  rating: 8.3,
  genre: 'Adventure'
}];