# backend/api/research/perplexity_api.py

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, Optional, List
import hashlib

# Load environment variables
load_dotenv()


class PerplexityClient:
    
    # Available models with different capabilities and costs
    MODELS = {
        "sonar_small": "llama-3.1-sonar-small-128k-online",      # Cheapest, fastest
        "sonar_large": "llama-3.1-sonar-large-128k-online",      # Better quality
        "sonar_pro": "llama-3.1-sonar-huge-128k-online",         # Best quality, most expensive
        "reasoning": "llama-3.1-sonar-reasoning-128k-online"     # For complex analysis
    }
    
    def __init__(self, api_key: str = None, default_model: str = "sonar_small"):
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
        """Estimate API cost based on token usage"""
        if not usage:
            return 0.0
        
        # Sonar small pricing: $1 per million tokens (input + output)
        total_tokens = usage.get("total_tokens", 0)
        return (total_tokens / 1_000_000) * 1.0  # $1 per million tokens
    
    def search_artist_info(self, artist_name: str, specific_query: str = None, model: str = None) -> Dict:
        """
        Search for comprehensive artist information using Perplexity
        
        Enhanced with detailed prompts for better results
        """
        
        selected_model = model or self.default_model
        
        if specific_query:
            # Custom query with enhanced context
            prompt = f"""You are a professional music journalist researching {artist_name}. 
            
            Research Query: {specific_query}
            
            Please provide:
            - Detailed, factual information with specific dates and sources
            - Direct quotes from interviews when available
            - Context about the music industry and cultural significance
            - Verification from multiple reliable sources
            - Interesting lesser-known facts that music fans would appreciate
            
            Focus on accuracy and cite all sources used."""
        else:
            # Comprehensive research prompt
            prompt = f"""You are an expert music researcher compiling a comprehensive profile of {artist_name} for a premium music education platform.
            
            Please research and provide detailed information about {artist_name} in the following categories:
            
            ## 1. BIOGRAPHY & EARLY LIFE
            - Birth date, location, family background
            - Childhood influences and early musical exposure
            - Education and formative experiences
            - Key events that shaped their artistic vision
            
            ## 2. MUSICAL CAREER TIMELINE
            - Career beginnings and breakthrough moments
            - Major albums with release dates and context
            - Collaborations and notable features
            - Evolution of their musical style
            - Label history and business decisions
            
            ## 3. CULTURAL IMPACT & ACHIEVEMENTS
            - Awards and critical recognition
            - Influence on other artists and genres
            - Social and cultural contributions
            - Groundbreaking moments in their career
            
            ## 4. RECENT ACTIVITIES & NEWS
            - Latest releases or projects (2020-2024)
            - Recent interviews or public appearances
            - Current artistic direction
            - Upcoming projects or rumors
            
            ## 5. INTERESTING FACTS & STORIES
            - Behind-the-scenes stories from recording sessions
            - Personal anecdotes from interviews
            - Lesser-known collaborations or unreleased material
            - Fan culture and community insights
            
            Please provide specific dates, sources, and quotes where possible. This information will be used to create an immersive educational experience for music fans."""
        
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
            "search_domain_filter": ["wikipedia.org", "pitchfork.com", "rollingstone.com", "billboard.com", "complex.com"],
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
        
        prompt = f"""You are a music critic and historian researching the album "{album_name}" by {artist_name} for an in-depth documentary.
        
        Please provide comprehensive information about this album:
        
        ## ALBUM OVERVIEW
        - Exact release date and label information
        - Genre and musical style classification
        - Album length, track count, and formats released
        
        ## CREATION & RECORDING
        - Recording timeline and studio locations
        - Producers, engineers, and key collaborators
        - Recording techniques and equipment used
        - Budget and recording challenges
        
        ## MUSICAL CONTENT
        - Complete track listing with song descriptions
        - Standout tracks and their significance
        - Musical themes and lyrical content
        - Influences and inspirations
        
        ## COMMERCIAL PERFORMANCE
        - Chart positions in major markets
        - Sales figures and certifications
        - Singles released and their performance
        - Marketing and promotion strategies
        
        ## CRITICAL RECEPTION
        - Initial reviews from major publications
        - Critic scores and awards received
        - Long-term critical reassessment
        - Cultural impact and legacy
        
        ## BEHIND-THE-SCENES STORIES
        - Interesting anecdotes from recording sessions
        - Artist interviews about the album creation
        - Label politics or industry challenges
        - Fan reactions and memorable moments
        
        Include specific dates, sources, and direct quotes where available."""
        
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
            "search_domain_filter": ["pitchfork.com", "rollingstone.com", "allmusic.com", "metacritic.com", "wikipedia.org"]
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
        
        prompt = f"""You are a music journalist investigating the complete story behind "{song_name}" by {artist_name}.
        
        Please research and provide detailed information about:
        
        ## SONG CREATION
        - Writing process and timeline
        - Co-writers and collaborators
        - Original inspiration and concept
        - Demo versions and early iterations
        
        ## MUSICAL COMPOSITION
        - Key, tempo, and musical structure
        - Instrumentation and arrangement details
        - Samples used (if any) and their sources
        - Production techniques and effects
        
        ## LYRICAL CONTENT
        - Meaning and interpretation
        - Personal experiences referenced
        - Literary or cultural references
        - Artist's own explanation of the lyrics
        
        ## RECORDING & PRODUCTION
        - Recording date and studio location
        - Producer and engineer credits
        - Recording techniques and equipment
        - Interesting studio stories
        
        ## RELEASE & RECEPTION
        - Release date and context within album/project
        - Commercial performance and chart positions
        - Critical reception and reviews
        - Music video details (if applicable)
        
        ## CULTURAL IMPACT
        - Cover versions by other artists
        - Use in films, TV, or advertisements
        - Live performance history
        - Fan interpretations and theories
        
        ## INTERVIEWS & QUOTES
        - Direct quotes from the artist about the song
        - Producer or collaborator insights
        - Behind-the-scenes anecdotes
        - Fan or critic commentary
        
        Focus on verified information and include sources for all claims."""
        
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
            "search_domain_filter": ["genius.com", "pitchfork.com", "rollingstone.com", "songfacts.com", "wikipedia.org"]
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
        
        prompt = f"""You are a senior music journalist creating an authoritative timeline for {artist_name}.
        
        Research {artist_name}'s career chronologically using only premium music sources (Rolling Stone, Pitchfork, Complex, Billboard, The Fader, NPR Music, Grammy.com).
        
        Create a detailed timeline with:
        
        **EARLY LIFE & CAREER (Birth - First Release)**
        - Birth date and location
        - Musical influences and early experiences
        - First recordings or performances
        - Career beginnings and breakthrough moments
        
        **MAJOR RELEASES & MILESTONES**
        - Album releases with exact dates
        - Chart performance and critical reception
        - Award wins and nominations
        - Significant collaborations
        
        **CULTURAL IMPACT & RECENT ACTIVITY**
        - Groundbreaking moments or statements
        - Recent projects and current status
        - Industry influence and legacy
        
        For each major event, provide:
        - Exact date (when available)
        - Context and significance  
        - Source publication
        - Impact on career/culture
        
        Focus on verified facts from music industry sources, not speculation."""
        
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
    client = PerplexityClient(default_model="sonar_small")
    
    print("🎵 Testing Enhanced Perplexity Client...")
    print("="*50)
    
    # Test comprehensive artist info
    print("\n1. Testing comprehensive artist research...")
    result = client.search_artist_info("Frank Ocean")
    
    if "error" not in result:
        print("✅ Artist research successful!")
        print(f"📊 Tokens used: {result['usage']['total_tokens']}")
        print(f"💰 Estimated cost: ${result['usage']['total_tokens'] / 1_000_000:.6f}")
        print(f"📚 Citations: {len(result.get('citations', []))}")
        print(f"📝 Response length: {len(result['choices'][0]['message']['content'])} chars")
    else:
        print("❌ Error:", result['error'])
    
    print("\n" + "="*50)
    print("Check the data/research/ folder for saved responses!")