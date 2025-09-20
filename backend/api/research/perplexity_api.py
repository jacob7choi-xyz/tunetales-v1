# backend/api/research/perplexity_api.py

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict
import hashlib

# Load environment variables
load_dotenv()


class PerplexityClient:
    
    # Available models with different capabilities and costs
    MODELS = {
        "sonar_small": "llama-3.1-sonar-small-128k-online",
        "sonar_large": "llama-3.1-sonar-large-128k-online", 
        "sonar_pro": "sonar-pro",  # Correct new model name
        "sonar": "sonar",  # Basic new model
        "reasoning": "llama-3.1-sonar-reasoning-128k-online"  # If this exists
        }
    
    def __init__(self, api_key: str = None, default_model: str = "sonar_pro"):
        self.api_key = api_key or os.getenv('PERPLEXITY_API_KEY')
        self.base_url = "https://api.perplexity.ai"
        self.default_model = self.MODELS.get(default_model, self.MODELS["sonar_small"])
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Create data directory for storing responses
        self.data_dir = os.path.join(os.path.dirname(__file__), "../../../data/research")
        os.makedirs(self.data_dir, exist_ok=True)
    
    def _save_response(self, query_type: str, artist_name: str, query_details: str, response: Dict) -> str:
        """Save API response to file for future analysis and reinforcement learning"""
        
        # Create unique filename based on query
        query_hash = hashlib.md5(f"{artist_name}_{query_details}".encode()).hexdigest()[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{query_type}_{artist_name.replace(' ', '_')}_{query_hash}_{timestamp}.json"
        
        # Prepare data for storage
        storage_data = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "query_type": query_type,
                "artist_name": artist_name,
                "query_details": query_details,
                "model_used": response.get("model", "unknown"),
                "tokens_used": response.get("usage", {}).get("total_tokens", 0),
                "cost_estimate": self._estimate_cost(response.get("usage", {}))
            },
            "response": response
        }
        
        # Save to file
        filepath = os.path.join(self.data_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(storage_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Response saved to: {filename}")
        return filepath
    
    def _estimate_cost(self, usage: Dict) -> float:
        """Estimate API cost based on token usage and model pricing"""
        if not usage:
            return 0.0
        
        # Updated Perplexity pricing (as of 2024/2025)
        # sonar-pro: ~$20 per million tokens
        # sonar models: ~$5 per million tokens  
        # sonar_small/large: ~$1 per million tokens
        
        total_tokens = usage.get("total_tokens", 0)

        # Determine pricing based on model used
        model_used = usage.get("model", self.default_model)
        
        if "sonar-pro" in str(model_used):
            rate = 20.0  # $20 per million tokens
        elif "sonar" in str(model_used) and "small" not in str(model_used) and "large" not in str(model_used):
            rate = 5.0   # $5 per million tokens for basic sonar
        else:
            rate = 1.0   # $1 per million tokens for sonar_small/large
        
        return (total_tokens / 1_000_000) * rate    
    
    def search_artist_info(self, artist_name: str, specific_query: str = None, model: str = None) -> Dict:
        """
        Search for comprehensive artist information using Perplexity
        
        Enhanced with detailed prompts for better results
        """
        
        selected_model = model or self.default_model
        
        if specific_query:
            # Custom query with enhanced context
            prompt = f"""Research {specific_query} about {artist_name} using ONLY premium music journalism sources.

            REQUIRED SOURCES (prioritize in this order):
            1. Rolling Stone magazine articles and interviews
            2. Pitchfork reviews and features  
            3. Complex magazine coverage
            4. Billboard industry reporting
            5. The Fader interviews and profiles
            6. NPR Music features
            7. Genius lyrical annotations and artist verified content

            STRICTLY EXCLUDE: Wikipedia, fan sites, blogs, social media posts, unofficial sources

            Please provide:
            - Detailed, factual information with specific dates and sources
            - Direct quotes from interviews when available
            - Context about the music industry and cultural significance
            - Verification from multiple reliable music journalism sources
            - Interesting lesser-known facts from industry insiders
            - Emotional context and human stories from credible interviews

            Include publication name and date for every fact cited."""
        else:
            # Comprehensive research prompt with premium source requirements
            prompt = f"""Research {artist_name} using ONLY premium music journalism sources for TuneTales, 
            a premium storytelling platform. 

            REQUIRED SOURCES ONLY:
            - Rolling Stone (interviews, features, reviews)
            - Pitchfork (reviews, interviews, profiles)
            - Complex (cover stories, interviews)
            - Billboard (industry reporting, charts)
            - The Fader (long-form profiles)
            - NPR Music (features, interviews)
            - Genius (verified lyrical content, artist annotations)

            STRICTLY EXCLUDE: Wikipedia, fan sites, blogs, social media

            Compile comprehensive information about {artist_name}:

            ## 1. BIOGRAPHY & EARLY LIFE
            - Birth date, location, family background (from verified interviews)
            - Childhood influences and early musical exposure
            - Education and formative experiences
            - Key events that shaped their artistic vision

            ## 2. MUSICAL CAREER TIMELINE
            - Career beginnings and breakthrough moments
            - Major albums with release dates and industry context
            - Collaborations and notable features
            - Evolution of their musical style
            - Label history and business decisions

            ## 3. CULTURAL IMPACT & ACHIEVEMENTS
            - Awards and critical recognition from music industry
            - Influence on other artists and genres
            - Social and cultural contributions
            - Groundbreaking moments covered by music press

            ## 4. RECENT ACTIVITIES & NEWS
            - Latest releases or projects (from industry sources)
            - Recent interviews from major music publications
            - Current artistic direction
            - Industry rumors from credible sources

            ## 5. PREMIUM INSIGHTS & STORIES
            - Behind-the-scenes stories from recording sessions
            - Personal anecdotes from major music magazine interviews
            - Industry insider perspectives
            - Exclusive content from music journalism

            ## 6. EMOTIONAL & STORYTELLING ELEMENTS
            - Personal struggles and triumphs from verified interviews
            - Vulnerable moments and breakthrough experiences
            - Relationships and life events that influenced their artistry
            - Stories that reveal their humanity from credible sources

            Cite specific publication names and dates. Focus on premium music journalism insights."""
                    
        payload = {
            "model": selected_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 3000,
            "temperature": 0.1,  # Lower temperature for more factual responses
            "search_domain_filter": [
                "rollingstone.com", 
                "pitchfork.com", 
                "complex.com", 
                "billboard.com",
                "thefader.com",
                "npr.org",
                "genius.com"
            ],
            "search_recency_filter": "year"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=45
            )
            response.raise_for_status()
            result = response.json()
            
            # Save response for analysis
            self._save_response("artist_info", artist_name, specific_query or "comprehensive", result)
            
            return result
            
        except requests.RequestException as e:
            print(f"Error calling Perplexity API: {e}")
            return {"error": str(e)}
    
    def get_album_info(self, artist_name: str, album_name: str, model: str = None) -> Dict:
        """Get detailed information about a specific album with enhanced prompts"""
        
        selected_model = model or self.default_model
        
        prompt = f"""Research the album "{album_name}" by {artist_name} using ONLY premium music journalism sources.

        REQUIRED SOURCES ONLY:
        - Rolling Stone (album reviews, interviews)
        - Pitchfork (reviews, retrospectives)
        - Complex (album coverage, interviews)
        - Billboard (commercial performance, industry context)
        - The Fader (album profiles, interviews)
        - NPR Music (album reviews, artist interviews)
        - AllMusic (professional discography data)
        - Metacritic (review aggregation from credible sources)

        STRICTLY EXCLUDE: Wikipedia, fan sites, blogs, social media

        Provide comprehensive album information:

        ## ALBUM OVERVIEW
        - Exact release date and label information
        - Genre and musical style from professional reviews
        - Album length, track count, and formats released

        ## CREATION & RECORDING (from interviews)
        - Recording timeline and studio locations
        - Producers, engineers, and key collaborators
        - Recording techniques from professional sources
        - Budget and recording challenges from industry reporting

        ## MUSICAL CONTENT (from reviews and interviews)
        - Complete track listing with professional descriptions
        - Standout tracks according to critics
        - Musical themes and lyrical content analysis
        - Influences and inspirations from artist interviews

        ## COMMERCIAL PERFORMANCE (from Billboard/industry sources)
        - Chart positions in major markets
        - Sales figures and certifications
        - Singles released and their performance
        - Marketing strategies from industry sources

        ## CRITICAL RECEPTION (from major music publications)
        - Reviews from Rolling Stone, Pitchfork, Complex
        - Professional critic scores and awards
        - Long-term critical reassessment
        - Cultural impact from music journalism

        ## BEHIND-THE-SCENES (from credible interviews)
        - Recording session stories from interviews
        - Artist statements about album creation
        - Industry challenges from music press
        - Professional commentary and analysis

        Cite specific publication names and dates for all information."""
        
        payload = {
            "model": selected_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2500,
            "temperature": 0.1,
            "search_domain_filter": [
                "rollingstone.com",
                "pitchfork.com", 
                "complex.com",
                "billboard.com",
                "thefader.com",
                "npr.org",
                "allmusic.com",
                "metacritic.com"
            ]
        }  
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=45
            )
            response.raise_for_status()
            result = response.json()
            
            # Save response
            self._save_response("album_info", artist_name, album_name, result)
            
            return result
            
        except requests.RequestException as e:
            print(f"Error researching album: {e}")
            return {"error": str(e)}
    
    def get_song_story(self, artist_name: str, song_name: str, model: str = None) -> Dict:
        """Get the complete story behind a specific song"""
        
        selected_model = model or self.default_model
        
        prompt = f"""Research the complete story behind "{song_name}" by {artist_name} using ONLY premium music sources.

        REQUIRED SOURCES ONLY:
        - Genius (verified artist annotations, lyrical breakdowns)
        - Rolling Stone (song interviews, album coverage)
        - Pitchfork (song analysis, reviews)
        - Complex (track breakdowns, interviews)
        - The Fader (artist interviews about specific songs)
        - NPR Music (song features, interviews)
        - Songfacts (verified song information)

        STRICTLY EXCLUDE: Wikipedia, fan sites, blogs, unverified sources

        Research comprehensive song details:

        ## SONG CREATION (from interviews)
        - Writing process and timeline from artist interviews
        - Co-writers and collaborators from credits
        - Original inspiration from verified artist statements
        - Demo versions and iterations from industry sources

        ## MUSICAL COMPOSITION (from professional analysis)
        - Key, tempo, and structure from music analysis
        - Instrumentation details from production credits
        - Samples used and their sources from verified data
        - Production techniques from professional sources

        ## LYRICAL CONTENT (from Genius and interviews)
        - Meaning from verified artist explanations
        - Personal experiences referenced in interviews
        - Cultural references from professional analysis
        - Artist's own lyrical explanations

        ## RECORDING & PRODUCTION (from industry sources)
        - Recording details from professional sources
        - Producer and engineer credits
        - Studio stories from credible interviews
        - Technical details from industry reporting

        ## RELEASE & RECEPTION (from music press)
        - Release context from music journalism
        - Commercial performance from Billboard
        - Critical reception from major publications
        - Music video details from industry sources

        ## CULTURAL IMPACT (from music journalism)
        - Cover versions documented by music press
        - Media usage from industry tracking
        - Live performance history from concert reviews
        - Professional critical analysis

        Focus on verified information from credible music sources. Include publication names and dates."""
                
        payload = {
            "model": selected_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.1,
            "search_domain_filter": [
                "genius.com",
                "rollingstone.com",
                "pitchfork.com", 
                "complex.com",
                "thefader.com",
                "npr.org",
                "songfacts.com"
            ]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=45
            )
            response.raise_for_status()
            result = response.json()
            
            # Save response
            self._save_response("song_story", artist_name, song_name, result)
            
            return result
            
        except requests.RequestException as e:
            print(f"Error researching song: {e}")
            return {"error": str(e)}
    
    def get_timeline_research(self, artist_name: str, model: str = None) -> Dict:
        """Special method for timeline creation - focuses on chronological events from premium sources"""
        
        selected_model = model or self.default_model
        
        prompt = f"""Create an authoritative timeline for {artist_name} using ONLY premium music industry sources.

        REQUIRED SOURCES ONLY:
        - Rolling Stone (career milestones, interviews)
        - Pitchfork (album releases, critical moments)
        - Complex (career coverage, profiles)
        - Billboard (chart data, industry milestones)
        - The Fader (career profiles, interviews)
        - NPR Music (career features, interviews)
        - Grammy.com (award information)

        STRICTLY EXCLUDE: Wikipedia, fan sites, unofficial sources

        Create detailed timeline with verified information:

        **EARLY LIFE & CAREER (from interviews)**
        - Birth date and location from verified sources
        - Musical influences from artist interviews
        - First recordings from industry documentation
        - Career beginnings from music journalism

        **MAJOR RELEASES & MILESTONES (from industry sources)**
        - Album releases with exact dates from labels/Billboard
        - Chart performance from Billboard data
        - Critical reception from major publications
        - Award wins from official sources

        **CULTURAL IMPACT & RECENT ACTIVITY (from music press)**
        - Groundbreaking moments from music journalism
        - Recent projects from industry reporting
        - Industry influence from professional analysis

        **EMOTIONAL & PERSONAL JOURNEY (from credible interviews)**
        - Life events from verified artist interviews
        - Creative periods from music journalism
        - Personal struggles from credible sources
        - Artistic evolution from professional coverage

        For each event provide:
        - Exact date (when available from sources)
        - Source publication name
        - Context from music industry perspective
        - Impact on career from professional analysis

        Focus ONLY on information from credible music industry sources."""

        payload = {
            "model": selected_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2500,
            "temperature": 0.05,
            "search_domain_filter": [
                "rollingstone.com", 
                "pitchfork.com", 
                "complex.com", 
                "billboard.com", 
                "thefader.com",
                "npr.org",
                "grammy.com"
            ]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            
            # Save timeline research
            self._save_response("timeline", artist_name, "chronological_events", result)
            
            return result
            
        except requests.RequestException as e:
            print(f"Error researching timeline: {e}")
            return {"error": str(e)}


# Enhanced test function
if __name__ == "__main__":
    client = PerplexityClient(default_model="sonar_pro")
    
    print("🎵 Testing Premium-Only Perplexity Client...")
    print("="*50)
    
    # Test premium source research
    print("\n1. Testing premium music journalism research...")
    result = client.search_artist_info("Frank Ocean", "Frank Ocean Boys Don't Cry magazine Rolling Stone Pitchfork coverage")
    
    if "error" not in result:
        print("✅ Premium research successful!")
        print(f"📊 Tokens used: {result['usage']['total_tokens']}")
        print(f"💰 Estimated cost: ${result['usage']['total_tokens'] / 1_000_000:.6f}")
        
        # Check for premium sources in citations
        citations = result.get('citations', [])
        print(f"📚 Citations: {len(citations)}")
        
        premium_sources = [c for c in citations if any(domain in c for domain in 
                          ['rollingstone.com', 'pitchfork.com', 'complex.com', 'billboard.com', 'thefader.com', 'npr.org', 'genius.com'])]
        
        print(f"🏆 Premium sources: {len(premium_sources)}/{len(citations)}")
        
        if 'wikipedia.org' in str(citations):
            print("⚠️  WARNING: Wikipedia found in citations!")
        else:
            print("✅ No Wikipedia sources - premium only!")
            
    else:
        print("❌ Error:", result['error'])
    
    print("\n" + "="*50)
    print("Check the data/research/ folder for saved responses!")