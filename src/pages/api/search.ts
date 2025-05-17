import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

if (!supabaseUrl) {
    throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
    throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
if (!groqApiKey) {
    throw new Error("Missing environment variable GROQ_API_KEY");
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);

// Initialize Groq client
const groq = new Groq({ apiKey: groqApiKey });

// Define the embedding model and its dimensions
const EMBEDDING_MODEL = 'nomic-embed-text-v1.5'; // Groq embedding model
const EMBEDDING_DIMENSION = 768; // Dimension for nomic-embed-text-v1.5

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { query: searchQuery } = req.query;

    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim() === '') {
        return res.status(400).json({ error: 'Search query is required and must be a non-empty string.' });
    }

    try {
        // 1. Generate embedding for the search query using Groq
        console.log(`Generating embedding for query: "${searchQuery}" using model ${EMBEDDING_MODEL}`);
        const embeddingResponse = await groq.embeddings.create({
            model: EMBEDDING_MODEL,
            input: searchQuery,
        });

        if (!embeddingResponse.data || embeddingResponse.data.length === 0 || !embeddingResponse.data[0].embedding) {
            console.error('Failed to generate embedding for query:', searchQuery, 'Response:', embeddingResponse);
            return res.status(500).json({ error: 'Failed to generate embedding for the query.' });
        }
        const queryEmbedding = embeddingResponse.data[0].embedding;
        
        if (queryEmbedding.length !== EMBEDDING_DIMENSION) {
            console.error(`Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSION}, got ${queryEmbedding.length}`);
            return res.status(500).json({ error: 'Embedding dimension mismatch.'});
        }
        console.log(`Successfully generated embedding for query: "${searchQuery}"`);

        // 2. Perform pgvector similarity search in Supabase
        // This calls a PostgreSQL function `match_candidates` which you need to create in your Supabase SQL editor.
        // The function should handle the vector similarity search.
        console.log('Searching for candidates in Supabase...');
        const { data: candidates, error: rpcError } = await supabase.rpc('match_candidates', {
            query_embedding: queryEmbedding, // Ensure this matches the type in your SQL function (e.g., vector(768))
            match_threshold: 0.1,           // Adjust as needed (cosine similarity, so higher is better)
            match_count: 10,                // Number of results to return
        });

        if (rpcError) {
            console.error('Supabase RPC error:', rpcError);
            return res.status(500).json({ error: `Database error: ${rpcError.message}` });
        }

        if (!candidates || candidates.length === 0) {
            console.log(`No candidates found matching query: "${searchQuery}"`);
            return res.status(200).json({ message: 'No candidates found matching your query.', candidates: [] });
        }

        console.log(`Found ${candidates.length} candidates for query: "${searchQuery}"`);
        // 3. Return results as JSON
        return res.status(200).json({ candidates });

    } catch (err: any) {
        console.error('API route error:', err);
        let errorMessage = 'Internal server error';
        if (err.response && err.response.data && err.response.data.error) {
            errorMessage = `API error: ${err.response.data.error.message || err.message}`;
        } else if (err.message) {
            errorMessage = err.message;
        }
        return res.status(500).json({ error: errorMessage });
    }
} 