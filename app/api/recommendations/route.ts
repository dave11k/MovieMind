import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { tmdbAPI } from '../../../src/lib/tmdb';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres: string[];
  explanation?: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genre_names?: Record<number, string>;
}

interface Recommendation {
  movieId: number;
  title: string;
  explanation: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
}

interface EnrichedRecommendation extends Movie {
  explanation: string;
}

export async function POST(request: Request) {
  try {
    console.log('Starting recommendation generation...');
    
    const { favorites } = await request.json();
    console.log('Received favorites:', favorites?.length || 0);

    if (!favorites || !Array.isArray(favorites)) {
      console.error('Invalid favorites data received:', favorites);
      return NextResponse.json(
        { error: 'Invalid favorites data' },
        { status: 400 }
      );
    }

    // Fetch upcoming movies from TMDB
    console.log('Fetching upcoming movies...');
    try {
      const upcomingMovies = await tmdbAPI.getUpcomingMovies();
      console.log('Upcoming movies fetched:', upcomingMovies.results.length);
      
      const nextTwoYears = upcomingMovies.results.filter((movie: TMDBMovie) => {
        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        return releaseDate > today && releaseDate <= twoYearsFromNow;
      });

      // Remove any duplicate movies by ID
      const uniqueMovies = nextTwoYears.reduce((acc: TMDBMovie[], current: TMDBMovie) => {
        const exists = acc.find(movie => movie.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Shuffle the movies to add randomness to the selection pool
      const shuffledMovies = uniqueMovies.sort(() => Math.random() - 0.5);
      
      console.log('Filtered movies for next two years:', shuffledMovies.length);

      if (shuffledMovies.length === 0) {
        console.error('No upcoming movies found');
        return NextResponse.json(
          { error: 'No upcoming movies found' },
          { status: 404 }
        );
      }

      // Create a structured prompt for the AI with randomization
      console.log('Creating AI prompt...');
      const randomSeed = Math.floor(Math.random() * 10000);
      const currentTime = new Date().toISOString();
      const prompt = `As a movie recommendation expert (Session ID: ${randomSeed}, Time: ${currentTime}), analyze these favorite movies and upcoming releases to provide personalized recommendations.

Favorite Movies:
${favorites.map((movie: Movie) => `
- ${movie.title} (${movie.release_date})
  Genres: ${movie.genres.join(', ')}
  Overview: ${movie.overview}
`).join('\n')}

Upcoming Movies to Consider (IMPORTANT: Only recommend movies from this list):
${shuffledMovies.map((movie: TMDBMovie) => `
- ID: ${movie.id}
  Title: ${movie.title}
  Release Date: ${movie.release_date}
  Genres: ${movie.genre_ids.map((id: number) => movie.genre_names?.[id] || 'Unknown').join(', ')}
  Overview: ${movie.overview}
`).join('\n')}

Please provide 8 movie recommendations from the upcoming movies list above. For each recommendation:
1. Use ONLY the movie IDs from the list above
2. Explain why you're recommending it based on the user's favorite movies
3. Highlight any similarities in genre, style, or themes
4. Keep the explanation concise (2-3 sentences)
5. IMPORTANT: Do not recommend the same movie twice
6. IMPORTANT: Vary your selections - don't always pick the most obvious choices
7. Consider exploring different genres and styles to provide diverse recommendations
8. Mix popular and lesser-known upcoming titles for variety

IMPORTANT: 
- Return ONLY a valid JSON object with this exact structure
- Use ONLY movie IDs from the list above
- Do not include any markdown, code blocks, or additional text
- Escape any special characters in strings
- Do not recommend the same movie twice

Example format:
{
  "recommendations": [
    {
      "movieId": 123,  // Must be an ID from the list above
      "title": "Movie Title",
      "explanation": "This movie is recommended because..."
    }
  ]
}`;

      // Get recommendations from OpenAI
      console.log('Sending request to OpenAI...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a movie recommendation expert. Provide personalized movie recommendations based on user preferences and upcoming releases. Return only valid JSON, no markdown or additional text. Make sure to properly escape any special characters in strings. IMPORTANT: Vary your recommendations each time - don't always pick the same movies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 1000,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      });
      console.log('OpenAI response received');

      // Parse the AI response
      const aiResponse = completion.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      
      if (!aiResponse) {
        throw new Error('Empty response from OpenAI');
      }
      
      let recommendations: RecommendationsResponse = { recommendations: [] };
      try {
        // Clean the response by removing any markdown formatting and extra whitespace
        const cleanedResponse = aiResponse
          .replace(/```json\n?|\n?```/g, '') // Remove markdown code blocks
          .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes with regular quotes
          .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure property names are quoted
          .replace(/\*/g, '') // Remove asterisks
          .replace(/\\"/g, '"') // Fix escaped quotes
          .replace(/\n\s*/g, ' ') // Remove newlines and extra spaces
          .trim();

        console.log('Cleaned response:', cleanedResponse);

        // Try to find the JSON object in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('No JSON object found in cleaned response:', cleanedResponse);
          throw new Error('No valid JSON object found in response');
        }

        console.log('Extracted JSON:', jsonMatch[0]);

        try {
          recommendations = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Initial JSON parse failed:', parseError);
          console.error('JSON content:', jsonMatch[0]);
          
          // Try to fix common JSON issues more carefully
          let fixedResponse = jsonMatch[0];
          
          // Fix unquoted property names
          fixedResponse = fixedResponse.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          // Remove trailing commas
          fixedResponse = fixedResponse.replace(/,(\s*[}\]])/g, '$1');
          
          // Replace single quotes with double quotes (but be careful about contractions)
          fixedResponse = fixedResponse.replace(/(?<!\\)'/g, '"');
          
          // Fix any remaining escaped characters
          fixedResponse = fixedResponse.replace(/\\/g, '\\\\');
          
          console.log('Attempting to parse fixed response:', fixedResponse);
          
          try {
            recommendations = JSON.parse(fixedResponse);
          } catch (secondParseError) {
            console.error('Second JSON parse attempt failed:', secondParseError);
            console.error('Fixed response content:', fixedResponse);
            
            // Last resort: try to manually parse the recommendations array
            try {
              const recommendationsMatch = fixedResponse.match(/"recommendations"\s*:\s*\[([\s\S]*)\]/);
              if (recommendationsMatch) {
                const recommendationsStr = recommendationsMatch[1];
                const movieMatches = recommendationsStr.match(/\{[^}]+\}/g);
                if (movieMatches) {
                  const parsedMovies = movieMatches.map(movieStr => {
                    const movieId = movieStr.match(/"movieId"\s*:\s*(\d+)/)?.[1];
                    const title = movieStr.match(/"title"\s*:\s*"([^"]+)"/)?.[1];
                    const explanation = movieStr.match(/"explanation"\s*:\s*"([^"]+)"/)?.[1];
                    return {
                      movieId: parseInt(movieId || '0'),
                      title: title || '',
                      explanation: explanation || ''
                    };
                  }).filter(movie => movie.movieId && movie.title && movie.explanation);
                  
                  recommendations = { recommendations: parsedMovies };
                }
              }
            } catch (manualParseError) {
              console.error('Manual parse attempt failed:', manualParseError);
              throw new Error('Failed to parse AI response after all cleanup attempts');
            }
          }
        }

        if (!recommendations?.recommendations || !Array.isArray(recommendations.recommendations)) {
          throw new Error('Invalid recommendations format: missing or invalid recommendations array');
        }

        // Validate each recommendation has required fields
        recommendations.recommendations = recommendations.recommendations.filter((rec: Recommendation) => {
          if (!rec.movieId || typeof rec.movieId !== 'number') {
            console.warn('Invalid recommendation: missing or invalid movieId', rec);
            return false;
          }
          if (!rec.title || typeof rec.title !== 'string') {
            console.warn('Invalid recommendation: missing or invalid title', rec);
            return false;
          }
          if (!rec.explanation || typeof rec.explanation !== 'string') {
            console.warn('Invalid recommendation: missing or invalid explanation', rec);
            return false;
          }
          return true;
        });

        console.log('Parsed recommendations:', recommendations.recommendations?.length || 0);
      } catch (error) {
        console.error('Error parsing AI response:', error);
        return NextResponse.json(
          { 
            error: 'Failed to parse AI recommendations', 
            details: error instanceof Error ? error.message : 'Unknown error',
            rawResponse: aiResponse // Include raw response for debugging
          },
          { status: 500 }
        );
      }

      // Enrich recommendations with movie details
      console.log('Enriching recommendations with movie details...');
      const enrichedRecommendations = await Promise.all(
        recommendations.recommendations.map(async (rec: Recommendation) => {
          try {
            // Validate that the movie exists in our upcoming movies list
            const validMovie = shuffledMovies.find((movie: TMDBMovie) => movie.id === rec.movieId);
            if (!validMovie) {
              console.warn(`Movie ID ${rec.movieId} not found in upcoming movies list`);
              return null;
            }

            // Fetch complete movie details from TMDB
            const movieDetails = await tmdbAPI.getMovieDetails(rec.movieId);
            
            // Map the TMDB response to our Movie interface
            return {
              id: movieDetails.id,
              title: movieDetails.title,
              overview: movieDetails.overview,
              poster_path: movieDetails.poster_path,
              release_date: movieDetails.release_date,
              vote_average: movieDetails.vote_average,
              genre_ids: movieDetails.genres.map((g: { id: number; name: string }) => g.id),
              genres: movieDetails.genres.map((g: { id: number; name: string }) => g.name),
              explanation: rec.explanation
            } as EnrichedRecommendation;
          } catch (error) {
            console.error(`Error fetching details for movie ${rec.movieId}:`, error);
            return null;
          }
        })
      );

      // Filter out any null recommendations (invalid movies)
      const validRecommendations = enrichedRecommendations.filter((rec): rec is EnrichedRecommendation => rec !== null);
      console.log('Final recommendations count:', validRecommendations.length);

      if (validRecommendations.length === 0) {
        return NextResponse.json(
          { error: 'No valid recommendations could be generated' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        recommendations: validRecommendations
      });

    } catch (error) {
      console.error('Error in TMDB or OpenAI processing:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process movie data or generate recommendations',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in recommendation generation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 