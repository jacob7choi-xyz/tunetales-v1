# backend/services/ai/claude_client.py

import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, List, Optional
import glob

# Load environment variables
load_dotenv()


class ClaudeStorytellingClient:
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('CLAUDE_API_KEY')
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        # Paths for reading research data and saving stories
        self.research_dir = os.path.join(os.path.dirname(__file__), "../../../data/research")
        self.stories_dir = os.path.join(os.path.dirname(__file__), "../../../data/stories")
        os.makedirs(self.stories_dir, exist_ok=True)
    
    def _load_research_data(self, artist_name: str) -> Dict:
        """Load all Perplexity research data for an artist"""
        
        research_files = glob.glob(f"{self.research_dir}/*{artist_name.replace(' ', '_')}*.json")
        
        if not research_files:
            raise FileNotFoundError(f"No research data found for {artist_name}")
        
        combined_research = {
            "artist_info": None,
            "timeline": None,
            "albums": [],
            "songs": []
        }
        
        for file_path in research_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                query_type = data.get("metadata", {}).get("query_type", "")
                
                if query_type == "artist_info":
                    combined_research["artist_info"] = data
                elif query_type == "timeline":
                    combined_research["timeline"] = data
                elif query_type == "album_info":
                    combined_research["albums"].append(data)
                elif query_type == "song_story":
                    combined_research["songs"].append(data)
                    
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
                continue
        
        return combined_research
    
    def _save_story(self, story_type: str, artist_name: str, content_name: str, story_data: Dict) -> str:
        """Save generated story to file"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{story_type}_{artist_name.replace(' ', '_')}_{content_name.replace(' ', '_')}_{timestamp}.json"
        
        filepath = os.path.join(self.stories_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(story_data, f, indent=2, ensure_ascii=False)
        
        print(f"🎬 Story saved to: {filename}")
        return filepath
    
    def create_artist_narrative(self, artist_name: str, narrative_style: str = "disney") -> Dict:
        """Transform artist research into a compelling narrative overview"""
    
        research_data = self._load_research_data(artist_name)
        
        if not research_data["artist_info"]:
            raise ValueError(f"No artist info found for {artist_name}")
        
        # Extract the research content
        artist_content = research_data["artist_info"]["response"]["choices"][0]["message"]["content"]
        timeline_content = research_data["timeline"]["response"]["choices"][0]["message"]["content"] if research_data["timeline"] else ""
        
        prompt = f"""You are a gentle, wise storyteller in the tradition of Disney's greatest narrators - think Jiminy Cricket or the narrator from classic Disney films. You have a warm, twinkling voice that makes listeners feel like they're gathered around a cozy fireplace, hearing a wonderful story about someone quite special.

        Tell the story of {artist_name} with the heart and wonder of a Disney tale - magical but real, whimsical but grounded, beautiful but never overly dramatic.

        RESEARCH TO WEAVE INTO YOUR STORY:
        {artist_content}

        {f"TIMELINE DETAILS: {timeline_content}" if timeline_content else ""}

        Create a gentle, enchanting narrative with these sections:

        ## Once Upon a Time...
        Begin like a classic Disney story. Introduce {artist_name} as a person - where they came from, what made them special from the start. Use warm, simple language that makes listeners smile and feel curious to know more.

        ## The Magic They Discovered
        Tell us about their musical gift - not as something grandiose, but as something beautiful they found along the way. How did they discover their voice? What made their music special? Make it feel like watching someone discover they can paint with starlight.

        ## Adventures Along the Way
        Share 3-4 key moments in their journey - the challenges they faced, the friends they met, the choices they made. Tell these like gentle adventures, with wisdom and heart. Even difficult moments should feel like part of a greater story of growth.

        ## The Gift They Share
        Conclude with how their music touches hearts and what makes them special in the world. Keep it warm and hopeful, like the end of a beloved Disney film.

        DISNEY STORYTELLING GUIDELINES:
        - Write in third person with a warm narrator voice ("Now, Frank was the kind of person who...")
        - Use gentle, accessible language - beautiful but not overly poetic
        - Include moments of quiet wonder and gentle humor
        - Focus on heart, hope, and human connection over drama
        - Keep metaphors simple and warm (like comparing music to "painting with sound" rather than complex imagery)
        - Make it feel like a bedtime story told by someone who truly cares about the subject
        - 700-900 words of pure warmth and wonder
        - End on a note that makes listeners feel inspired and happy

        Remember: This isn't a biography - it's a gentle celebration of a remarkable person, told with all the heart and magic of classic Disney storytelling."""

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 2000,
                    "temperature": 0.7,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                },
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            
            # Structure the story data
            story_data = {
                "metadata": {
                    "timestamp": datetime.now().isoformat(),
                    "artist_name": artist_name,
                    "story_type": "artist_narrative",
                    "narrative_style": narrative_style,
                    "model_used": "claude-3-5-sonnet-20241022",
                    "tokens_used": result.get("usage", {}).get("output_tokens", 0)
                },
                "narrative": result["content"][0]["text"],
                "source_research": {
                    "artist_info_file": research_data["artist_info"]["metadata"] if research_data["artist_info"] else None,
                    "timeline_file": research_data["timeline"]["metadata"] if research_data["timeline"] else None
                }
            }
            
            # Save the story
            self._save_story("narrative", artist_name, "overview", story_data)
            
            return story_data
            
        except requests.RequestException as e:
            print(f"Error calling Claude API: {e}")
            return {"error": str(e)}
    
    def create_song_story(self, artist_name: str, song_name: str) -> Dict:
        """Transform song research into an intimate story about the song's creation and meaning"""
        
        research_data = self._load_research_data(artist_name)
        
        # Find the specific song research
        song_research = None
        for song_data in research_data["songs"]:
            if song_name.lower() in song_data["metadata"]["query_details"].lower():
                song_research = song_data
                break
        
        if not song_research:
            raise ValueError(f"No research found for song: {song_name}")
        
        song_content = song_research["response"]["choices"][0]["message"]["content"]
        
        prompt = f"""You are a gentle Disney storyteller, and you're about to share the delightful tale of how a very special song came to be. Think of how Jiminy Cricket might tell the story of how "{song_name}" was born - with wonder, warmth, and that special Disney magic that makes even ordinary moments feel extraordinary.

        RESEARCH TO WEAVE INTO YOUR STORY:
        {song_content}

        Tell the enchanting story of "{song_name}" by {artist_name} with these gentle chapters:

        ## How It All Began
        Set the scene like the opening of a Disney film. Where was {artist_name} when this song first whispered to them? What was happening in their world? Make it feel magical but real - like the moment when Pinocchio first wishes upon a star.

        ## The Creative Adventure
        Tell us how the song grew and changed, like watching a garden bloom. Who helped along the way? What challenges did they face? What moments of discovery happened? Make it feel like a gentle adventure story.

        ## The Heart of the Song
        Share what the song really means - both to {artist_name} and to those who hear it. But tell it gently, like explaining why a lullaby is special, not like analyzing literature.

        ## Why It Matters
        End with how this song touches hearts and why it's become special to so many people. Keep it warm and hopeful.

        DISNEY STORYTELLING MAGIC:
        - Write as a warm, wise narrator telling a bedtime story
        - Use simple, beautiful language that makes people smile
        - Include gentle moments of wonder and discovery
        - Focus on the joy of creation and human connection
        - Keep it light and magical, never heavy or dramatic
        - Use warm metaphors (music "dancing through the air" rather than complex imagery)
        - Make listeners feel like they were there watching the magic happen
        - 500-700 words of pure enchantment
        - End with something that makes people feel happy and connected

        Remember: You're not writing a documentary - you're sharing a gentle, magical story about how something beautiful came into the world, told with all the heart of classic Disney storytelling."""

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 1500,
                    "temperature": 0.7,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                },
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            
            story_data = {
                "metadata": {
                    "timestamp": datetime.now().isoformat(),
                    "artist_name": artist_name,
                    "song_name": song_name,
                    "story_type": "song_story",
                    "model_used": "claude-3-5-sonnet-20241022",
                    "tokens_used": result.get("usage", {}).get("output_tokens", 0)
                },
                "story": result["content"][0]["text"],
                "source_research": song_research["metadata"]
            }
            
            self._save_story("song", artist_name, song_name, story_data)
            
            return story_data
            
        except requests.RequestException as e:
            print(f"Error creating song story: {e}")
            return {"error": str(e)}
    
    def create_bubble_universe(self, artist_name: str) -> Dict:
        """Create the complete bubble universe data structure for the artist"""
        
        research_data = self._load_research_data(artist_name)
        
        # Generate individual song stories for all researched songs
        song_bubbles = []
        for song_data in research_data["songs"]:
            song_name = song_data["metadata"]["query_details"]
            try:
                song_story = self.create_song_story(artist_name, song_name)
                if "error" not in song_story:
                    # Extract mood for bubble theming
                    mood = self._extract_song_mood(song_story["story"])
                    song_bubbles.append({
                        "song_name": song_name,
                        "story": song_story["story"],
                        "mood": mood,
                        "bubble_color": self._get_bubble_color(mood)
                    })
            except Exception as e:
                print(f"Error creating story for {song_name}: {e}")
                continue
        
        # Create artist overview narrative
        artist_narrative = self.create_artist_narrative(artist_name)
        
        bubble_universe = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "artist_name": artist_name,
                "total_bubbles": len(song_bubbles),
                "universe_type": "complete"
            },
            "artist_overview": artist_narrative.get("narrative", ""),
            "song_bubbles": song_bubbles
        }
        
        self._save_story("universe", artist_name, "complete", bubble_universe)
        
        return bubble_universe
    
    def _extract_song_mood(self, story_text: str) -> str:
        """Extract the emotional mood from a song story using Claude"""
        
        prompt = f"""Analyze this song story and identify its primary emotional mood in one word.

Story: {story_text[:500]}...

Choose the single word that best captures the emotional tone:
- nostalgic
- melancholic  
- energetic
- triumphant
- introspective
- romantic
- rebellious
- peaceful
- intense
- playful

Respond with only the mood word."""

        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json={
                    "model": "claude-3-5-haiku-20241022",  # Faster model for simple tasks
                    "max_tokens": 10,
                    "temperature": 0.3,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                },
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            return result["content"][0]["text"].strip().lower()
            
        except Exception as e:
            print(f"Error extracting mood: {e}")
            return "introspective"  # Default mood
    
    def _get_bubble_color(self, mood: str) -> str:
        """Map moods to bubble color schemes for UI theming"""
        
        mood_colors = {
            "nostalgic": "#9A6B9A",      # Purple
            "melancholic": "#4A6FA5",    # Blue
            "energetic": "#E74C3C",      # Red
            "triumphant": "#F39C12",     # Gold
            "introspective": "#27AE60",  # Green
            "romantic": "#E91E63",       # Pink
            "rebellious": "#8E44AD",     # Dark Purple
            "peaceful": "#3498DB",       # Light Blue
            "intense": "#D35400",        # Orange
            "playful": "#F1C40F"         # Yellow
        }
        
        return mood_colors.get(mood, "#7F8C8D")  # Default gray


# Test function
if __name__ == "__main__":
    client = ClaudeStorytellingClient()
    
    print("🎬 Testing Claude Storytelling Client...")
    print("="*60)
    
    # Test artist narrative creation
    try:
        print("\n1. Creating Frank Ocean narrative...")
        narrative = client.create_artist_narrative("Frank Ocean")
        
        if "error" not in narrative:
            print("✅ Artist narrative created successfully!")
            print(f"📊 Tokens used: {narrative['metadata']['tokens_used']}")
            print(f"📝 Story length: {len(narrative['narrative'])} characters")
            print("\n🎭 Preview:")
            print(narrative['narrative'][:200] + "...")
        else:
            print("❌ Error:", narrative['error'])
            
    except Exception as e:
        print(f"❌ Error testing narrative creation: {e}")
    
    print("\n" + "="*60)
    print("Check the data/stories/ folder for generated narratives!")