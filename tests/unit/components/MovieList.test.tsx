import { render, screen } from '../../utils/test-utils'
import { MovieList } from '@/components/MovieList'
import { mockMovieList, mockFavorites } from '../../fixtures/movies'
import { mockUser } from '../../fixtures/users'

describe('MovieList Component', () => {
  it('renders movie list correctly', () => {
    render(
      <MovieList 
        movies={mockMovieList}
        favorites={mockFavorites}
        onAddToFavorites={jest.fn()}
        onRemoveFromFavorites={jest.fn()}
      />
    )

    // Check if movies are rendered
    expect(screen.getByText('Awesome Action Movie')).toBeInTheDocument()
    expect(screen.getByText('Romantic Comedy Delight')).toBeInTheDocument()
    expect(screen.getByText('Thrilling Mystery')).toBeInTheDocument()
  })

  it('displays movie ratings when available', () => {
    render(
      <MovieList 
        movies={mockMovieList}
        favorites={[]}
        onAddToFavorites={jest.fn()}
        onRemoveFromFavorites={jest.fn()}
      />
    )

    // Check if ratings are displayed
    expect(screen.getByText('8.2')).toBeInTheDocument()
    expect(screen.getByText('7.8')).toBeInTheDocument()
    expect(screen.getByText('9.1')).toBeInTheDocument()
  })

  it('shows add button for non-favorite movies', () => {
    render(
      <MovieList 
        movies={mockMovieList}
        favorites={[]}
        onAddToFavorites={jest.fn()}
        onRemoveFromFavorites={jest.fn()}
      />
    )

    const addButtons = screen.getAllByText('Add')
    expect(addButtons).toHaveLength(3)
  })

  it('shows remove button for favorite movies', () => {
    render(
      <MovieList 
        movies={mockMovieList}
        favorites={mockFavorites}
        onAddToFavorites={jest.fn()}
        onRemoveFromFavorites={jest.fn()}
      />
    )

    // Should show remove buttons for movies that are in favorites
    const removeButtons = screen.getAllByText('Remove')
    expect(removeButtons).toHaveLength(2) // mockFavorites has 2 movies
  })

  it('displays IMDB buttons for all movies', () => {
    render(
      <MovieList 
        movies={mockMovieList}
        favorites={[]}
        onAddToFavorites={jest.fn()}
        onRemoveFromFavorites={jest.fn()}
      />
    )

    const imdbButtons = screen.getAllByText('IMDB')
    expect(imdbButtons).toHaveLength(3)
  })

  it('renders empty state when no movies provided', () => {
    render(
      <MovieList 
        movies={[]}
        favorites={[]}
        onAddToFavorites={jest.fn()}
        onRemoveFromFavorites={jest.fn()}
      />
    )

    // Should render the grid but with no movie items
    const movieGrid = screen.getByRole('generic')
    expect(movieGrid).toBeInTheDocument()
    expect(movieGrid).toHaveClass('grid')
  })

  it('handles disabled buttons when disableButtons prop is true', () => {
    render(
      <MovieList 
        movies={mockMovieList}
        favorites={[]}
        disableButtons={true}
      />
    )

    // Should not show add/remove buttons
    expect(screen.queryByText('Add')).not.toBeInTheDocument()
    expect(screen.queryByText('Remove')).not.toBeInTheDocument()
    
    // Should still show IMDB buttons
    const imdbButtons = screen.getAllByText('IMDB')
    expect(imdbButtons).toHaveLength(3)
  })
})