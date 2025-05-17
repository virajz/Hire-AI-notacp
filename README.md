# HireAI - AI-Powered Tech Recruiting Copilot

HireAI is a browser-based hiring copilot that helps in-house tech recruiters run natural-language searches over uploaded résumés, extract key skills/location/experience, and send personalized outreach emails—cutting manual sourcing time from hours to minutes.

## Project Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account with Service Role key
- Groq API key for LLM integration

### Environment Setup

1. Create a `.env` file based on the `env.template`:

```sh
# Copy the template
cp env.template .env

# Edit the .env file with your actual keys
```

2. Install dependencies:

```sh
npm install
```

3. Run the Supabase setup script to create necessary tables and storage:

```sh
node scripts/setup-supabase.mjs
```

4. Start the development server:

```sh
npm run dev
```

## Implemented Features

### Phase 2: Resume Processing Pipeline

The resume processing pipeline has been implemented with the following components:

1. **Resume Upload UI** - A drag-and-drop interface for uploading resumes in PDF, DOC, or DOCX format
2. **PDF Text Extraction** - Using pdf.js to extract text content from uploaded PDF files
3. **Classical Parser** - Regex-based parsing to extract basic candidate information
4. **Supabase Storage** - Storing the original resume files in a secure Supabase bucket
5. **Groq API Integration** - Generating embeddings for semantic search and candidate summaries
6. **Database Storage** - Storing parsed candidate data in Supabase PostgreSQL with pgvector

## Project Structure

- `/src/components/resume` - Resume upload components
- `/src/utils` - Utilities for PDF parsing, resume processing, and storage
- `/src/integrations` - API integrations (Supabase, Groq)
- `/src/config` - Environment configuration
- `/scripts` - Setup and maintenance scripts

## Next Steps

The next phase to implement is Phase 3: Search functionality with pgvector to enable natural language searches over the resume database.

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Auth, Storage, Database)
- pgvector for embeddings storage
- Groq API (Llama-3.3-70B)

## Project info

**URL**: https://lovable.dev/projects/2015f673-d51f-4b4c-a953-d7a18c898766

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2015f673-d51f-4b4c-a953-d7a18c898766) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2015f673-d51f-4b4c-a953-d7a18c898766) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
