// Simple utility test to verify Jest setup
describe('Testing Framework Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const testString = 'MovieMind'
    expect(testString.toLowerCase()).toBe('moviemind')
    expect(testString.length).toBe(9)
  })

  it('should handle array operations', () => {
    const movies = ['Movie 1', 'Movie 2', 'Movie 3']
    expect(movies).toHaveLength(3)
    expect(movies).toContain('Movie 2')
  })

  it('should handle object operations', () => {
    const movie = {
      id: 123,
      title: 'Test Movie',
      rating: 8.5
    }
    
    expect(movie).toHaveProperty('id', 123)
    expect(movie).toHaveProperty('title', 'Test Movie')
    expect(movie.rating).toBeGreaterThan(8)
  })

  it('should handle async operations', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('async result'), 10)
      })
    }

    const result = await asyncFunction()
    expect(result).toBe('async result')
  })
})