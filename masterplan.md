# HireAI – MVP Masterplan

## 1. App Overview & Objectives
A browser-based hiring copilot that lets in-house tech recruiters run natural-language searches over uploaded résumés, extract key skills/location/experience, and send a personalized outreach email—cutting manual sourcing time from hours to minutes.

## 2. Target Audience
* **Primary:** In-house recruiters & hiring managers at tech companies (single tenant for MVP).
* **Secondary (future):** Staffing agencies, multiple client tenants.

## 3. Core Features (MVP)
1. **Natural-language résumé search**  
2. **Hybrid résumé parsing & skill extraction**  
   * Hard skills, location/work-auth, seniority  
3. **Candidate cards UI**  
   * At-a-glance: name, current title, location/Auth, years exp  
   * Quick actions: ⭐ Shortlist, status dropdown  
4. **Candidate detail view**  
   * Llama-generated “why they fit” summary  
   * Actions: shortlist, status, quick-view résumé, send outreach  
5. **Personalized outreach email**  
   * System drafts via Llama-3.3 + role template → recruiter edits → send  
   * Sent from central “hireai.io” address via SendGrid (OAuth inbox connect later)  
6. **CSV export** of any results list

## 4. High-Level Technical Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | **Next.js (React) on Vercel** | 1-click deploy, serverless API routes, SSR/edge support |
| Auth | **Supabase Auth (Google SSO)** | Fast setup, RBAC ready |
| Storage | **Supabase Storage** | Store original résumé files (PDF/DOC) |
| Database | **Supabase Postgres + pgvector** | Structured data + vector search in one place |
| LLM / Embeddings | **Groq API – Llama-3.3-70B-versatile** | High-quality generation & embeddings |
| Résumé Parsing | **Classical parser → LLM fallback** | Speed with accuracy safety net |
| Email | **SendGrid transactional API** | Reliable deliverability, easy templates |
| Hosting | **Vercel** (frontend) + **Supabase** (backend) | Minimal ops in 5-hour window |

## 5. Conceptual Data Model
* **users** – id, name, email, role (“default”)  
* **candidates** – id, name, current_title, location, work_auth, years_exp, resume_url, raw_text, vector  
* **candidate_status** – candidate_id ↔ status (“new / contacted / interested / interviewing”), updated_by, timestamp  
* **shortlists** – user_id ↔ candidate_id  
* **email_log** – id, candidate_id, user_id, template_used, timestamp (future: opens/replies)

## 6. UX / UI Principles
* **Search-first**: Centered search bar with placeholder (“aws engineer in bangalore”).  
* **Card-deck animation**: Results stack → shuffle into grid.  
* **Minimal clicks**: Key actions right on card; deeper info in side panel.  
* **Consistent palette**: Clean, recruiter-friendly (light mode first).  

## 7. Security Considerations
* Google SSO only (MFA optional later).  
* Supabase row-level security scoped to single company.  
* TLS everywhere; résumés stored with bucket-level encryption.  
* No résumé-view logging yet (add in phase 2).  

## 8. Development Phases & Milestones
| Timing | Milestone | Notes |
|--------|-----------|-------|
| **T+1 hr** | Supabase project, tables, Storage buckets created; Vercel project scaffolded |  
| **T+2 hr** | Résumé upload → parse pipeline (classical) → store → embed via Groq | Basic form + API route |
| **T+3 hr** | Search endpoint + pgvector similarity query; simple results JSON | Postman test |
| **T+4 hr** | Next.js UI: search bar, card deck animation, shortlist & status actions | Static templates |
| **T+5 hr** | Email draft & send via SendGrid; CSV export; polish demo data | Live link ready |  

## 9. Future Expansion(not to be implemented)
* Candidate scoring & ranking weights  
* Multi-tenant SaaS with org-level RBAC  
* ATS import (Greenhouse, Lever)  
* Email open/reply tracking, multi-step sequences  
* External profile ingestion (LinkedIn, GitHub)  
* SOC 2 / GDPR compliance pipeline  
