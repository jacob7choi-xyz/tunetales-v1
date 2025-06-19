# TuneTales Research & Development Notes

## 🧪 AI Research Pipeline Status

### Perplexity API Integration
- **Status:** ✅ Complete and optimized
- **Model:** Using `sonar_small` for cost efficiency
- **Temperature:** 0.05-0.1 for factual accuracy
- **Cost:** ~$0.005 per artist profile
- **Source Filtering:** Premium music publications (Rolling Stone, Pitchfork, Complex, Billboard)

### Current Research Methods
1. `search_artist_info()` - Comprehensive artist profiles
2. `get_album_info()` - Album deep dives with creation stories  
3. `get_song_story()` - Individual track analysis
4. `get_timeline_research()` - Chronological artist journey

## 🎯 Frank Ocean MVP Research
- **Target:** 20-30 song bubbles from Nostalgia Ultra → Channel Orange → Blonde
- **Data Collected:** ✅ Artist info, timeline, album info saved to data/research/
- **Quality Assessment:** ✅ High-quality factual research verified

## 🎬 Claude Storytelling Pipeline - COMPLETE!
- **Status:** ✅ Built and tested successfully
- **Model:** Claude 3.5 Sonnet for narrative generation
- **Temperature:** 0.7 for creative storytelling
- **Cost:** ~$0.003 per story (848 tokens average)
- **Output Style:** Disney-quality whimsical storytelling (Jiminy Cricket voice)

## 📊 Performance Metrics
- **Research Accuracy:** ✅ High-quality verified from premium sources
- **Cost Per Artist Research:** ~$0.005 (Perplexity)
- **Cost Per Story Generation:** ~$0.003 (Claude)
- **Combined Cost Per Complete Story:** ~$0.008
- **Token Usage:** 1793 tokens (research) + 848 tokens (story) average
- **Processing Time:** 5-10 seconds (research) + 3-5 seconds (generation)

## 🧠 Major Learnings & Breakthrough Decisions

### Storytelling Style Evolution
- **Finding:** Original prompts were too dramatic/cinematic
- **Solution:** Refined to Disney storytelling style (Jiminy Cricket voice)
- **Result:** Perfect whimsical, warm, accessible narratives
- **Example:** "In a sun-drenched corner of Long Beach, California, a special little boy named Christopher was born with a gift..."

### Architecture Strategy  
- **Two-Phase Pipeline:** Perplexity (facts) → Claude (stories) ✅
- **Data Persistence:** Automatic JSON storage with metadata ✅
- **Temperature Optimization:** 0.1 for research, 0.7 for storytelling ✅

### Live Generation vs Pre-Generation Decision
- **Decision:** LIVE GENERATION chosen for TuneTales
- **Reasoning:** Creates "crafted just for you" premium experience
- **UX Strategy:** Beautiful loading states ("Researching archives... Weaving narrative...")
- **User Experience:** 8-15 second magical creation process
- **Competitive Advantage:** True AI-powered differentiation

## 🚀 Immediate Experiments
- [x] Run Frank Ocean comprehensive research
- [x] Test Claude storytelling transformation
- [x] Optimize prompts for Disney-style narratives
- [x] Validate live generation approach
- [ ] Build API layer connecting research → stories
- [ ] Create beautiful loading UX for live generation
- [ ] Test song-specific research and stories
- [ ] Build frontend bubble universe interface
- [ ] Deploy MVP to Vercel

## 💡 Future R&D Ideas
- **Completed:** AI storytelling pipeline with Disney voice
- **Next Phase:** Frontend integration with live generation
- **Advanced:** Dynamic mood-based visual theming
- **Blue Sky:** AI-generated UX/UI (requires massive ML infrastructure)
- **Expansion:** Multi-artist bubble universes
- **Monetization:** Premium storytelling experiences

## 🎯 Current Status: STORYTELLING ENGINE COMPLETE
- ✅ Research pipeline working perfectly
- ✅ Story transformation achieving Disney-quality output  
- ✅ Cost-efficient at scale (~$0.008 per complete story)
- ✅ Live generation architecture decided
- 🎯 **Ready for frontend integration and API development**

---
*Last Updated: June 20th, 2025 - 5:00 AM AEST*
*Research Phase: COMPLETE - Moving to Frontend Integration*