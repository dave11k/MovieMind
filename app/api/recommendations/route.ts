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
      
      const nextTwoYears = upcomingMovies.results.filter((movie: any) => {
        const releaseDate = new Date(movie.release_date);
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        return releaseDate <= twoYearsFromNow;
      });
      console.log('Filtered movies for next two years:', nextTwoYears.length);

      if (nextTwoYears.length === 0) {
        console.error('No upcoming movies found');
        return NextResponse.json(
          { error: 'No upcoming movies found' },
          { status: 404 }
        );
      }

      // Create a structured prompt for the AI
      console.log('Creating AI prompt...');
      const prompt = `As a movie recommendation expert, analyze these favorite movies and upcoming releases to provide personalized recommendations.

Favorite Movies:
${favorites.map((movie: Movie) => `
- ${movie.title} (${movie.release_date})
  Genres: ${movie.genres.join(', ')}
  Overview: ${movie.overview}
`).join('\n')}

Upcoming Movies to Consider (IMPORTANT: Only recommend movies from this list):
${nextTwoYears.map((movie: any) => `
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

IMPORTANT: 
- Return ONLY a valid JSON object with this exact structure
- Use ONLY movie IDs from the list above
- Do not include any markdown, code blocks, or additional text
- Escape any special characters in strings

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
            content: "You are a movie recommendation expert. Provide personalized movie recommendations based on user preferences and upcoming releases. Return only valid JSON, no markdown or additional text. Make sure to properly escape any special characters in strings."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      console.log('OpenAI response received');

      // Parse the AI response
      const aiResponse = completion.choices[0].message.content;
      console.log('Raw AI response:', aiResponse);
      
      let recommendations;
      try {
        // Clean the response by removing any markdown formatting and extra whitespace
        const cleanedResponse = aiResponse
          ?.replace(/```json\n?|\n?```/g, '') // Remove markdown code blocks
          ?.replace(/[\u2018\u2019]/g, "'") // Replace smart quotes with regular quotes
          ?.replace(/[\u201C\u201D]/g, '"') // Replace smart quotes with regular quotes
          ?.replace(/\n/g, ' ') // Replace newlines with spaces
          ?.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          ?.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure property names are quoted
          ?.trim();

        // Try to find the JSON object in the response
        const jsonMatch = cleanedResponse?.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON object found in response');
        }

        try {
          recommendations = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Initial JSON parse failed:', parseError);
          // Try to fix common JSON issues
          const fixedResponse = jsonMatch[0]
            .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure property names are quoted
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([^\\])"/g, '$1\\"') // Escape unescaped quotes
            .replace(/\\"/g, '"') // Fix double-escaped quotes
            .replace(/'/g, '"'); // Replace single quotes with double quotes

          try {
            recommendations = JSON.parse(fixedResponse);
          } catch (secondParseError) {
            console.error('Second JSON parse attempt failed:', secondParseError);
            throw new Error('Failed to parse AI response after cleanup attempts');
          }
        }

        if (!recommendations?.recommendations || !Array.isArray(recommendations.recommendations)) {
          throw new Error('Invalid recommendations format: missing or invalid recommendations array');
        }

        // Validate each recommendation has required fields
        recommendations.recommendations = recommendations.recommendations.filter((rec: any) => {
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
      } catch (error: any) {
        console.error('Error parsing AI response:', error);
        return NextResponse.json(
          { 
            error: 'Failed to parse AI recommendations', 
            details: error.message,
            rawResponse: aiResponse // Include raw response for debugging
          },
          { status: 500 }
        );
      }

      // Enrich recommendations with movie details
      console.log('Enriching recommendations with movie details...');
      const enrichedRecommendations = await Promise.all(
        recommendations.recommendations.map(async (rec: any) => {
          try {
            // Validate that the movie exists in our upcoming movies list
            const validMovie = nextTwoYears.find((movie: any) => movie.id === rec.movieId);
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
              genre_ids: movieDetails.genres.map((g: any) => g.id),
              genres: movieDetails.genres.map((g: any) => g.name),
              explanation: rec.explanation
            };
          } catch (error) {
            console.error(`Error fetching details for movie ${rec.movieId}:`, error);
            return null;
          }
        })
      );

      // Filter out any null recommendations (invalid movies)
      const validRecommendations = enrichedRecommendations.filter(rec => rec !== null);
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

    } catch (error: any) {
      console.error('Error in TMDB or OpenAI processing:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process movie data or generate recommendations',
          details: error.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error.message
      },
      { status: 500 }
    );
  }
} 