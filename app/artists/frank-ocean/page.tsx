'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, PlayIcon, LinkIcon, ClockIcon, CalendarIcon, UserIcon, MusicalNoteIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const FloatingNotesLayer = dynamic(() => import('../../components/FloatingNotesLayer'), {
  ssr: false,
  loading: () => <div></div>
});

// Research-based Frank Ocean story content using your new Perplexity data
const frankOceanStory = {
  title: "Frank Ocean: The Beautiful Mystery",
  sections: [
    {
      id: "origins",
      title: "THE BOY FROM LONG BEACH",
      content: `Christopher Edwin Breaux was born on October 28, 1987, in Long Beach, California. At home, he was called "Lonny" after his maternal grandfather, Lionel McGruder Jr., who would become a father figure after Christopher's own father, Calvin Cooksey, left the family when he was six years old. When Christopher was five, his mother Katonya moved the family to New Orleans, where he grew up immersed in the city's rich jazz traditions and listened to his mother's R&B collection in the car.

What shaped young Christopher most profoundly was accompanying his grandfather to Alcoholics Anonymous and Narcotics Anonymous meetings. Lionel was a recovering addict who served as a mentor at these meetings, and these experiences became masterclasses in human nature for teenage Frank, teaching him that beauty often emerges from life's darkest corners. This would later inspire his song "Crack Rock" from Channel Orange.

By thirteen, Christopher had decided to become a songwriter and started recording music while in high school, paying for studio time by washing neighbors' cars, mowing lawns and walking dogs. He was determined to make music his life.`
    },
    {
      id: "katrina",
      title: "THE STORM THAT CHANGED EVERYTHING", 
      content: `In 2005, after graduating high school, Christopher enrolled at the University of New Orleans to study English. But on August 29, Hurricane Katrina hit the city with devastating force. The recording facility where Christopher had been working was flooded and looted in the chaos that followed. What little music he had recorded was destroyed.

This catastrophe became transformation. Realizing there was no scope for continuing his recording dreams in New Orleans, Christopher made a life-changing decision: he would move to Los Angeles to pursue music, intending to stay only briefly to continue his recording projects.

In Los Angeles, he worked various fast-food and service jobs to support himself while establishing himself as a songwriter under the name Lonny Breaux. After getting a songwriting deal, he wrote tracks for major artists including Justin Bieber, Beyoncé, John Legend, and Brandy.`
    },
    {
      id: "boys_dont_cry",
      title: "THE BOYS DON'T CRY MASTERPIECE",
      content: `On August 20, 2016, Frank Ocean released one of the most innovative album rollouts in music history. Alongside his album "Blonde," he distributed a free 360-page magazine called "Boys Don't Cry" at pop-up shops in Los Angeles, New York City, Chicago, and London.

The magazine was a work of art itself, featuring photography by Wolfgang Tillmans and Viviane Sassen, and famously included a poem by Kanye West about McDonald's that became viral. But most significantly, it opened with a deeply personal letter from Frank Ocean reflecting on masculinity and vulnerability: "Boys do cry, but I don't think I shed a tear for a good chunk of my teenage years. It's surprisingly my favorite part of life so far."

This wasn't just an album release - it was Frank's declaration of independence from the traditional music industry. The magazine represented his break from Def Jam and the major-label system, marking a new era of artistic autonomy. The magazine included an extended version of "Nikes" featuring Japanese rapper KOHH, exclusive to the physical release.`
    },
    {
      id: "transformation",
      title: "BECOMING FRANK OCEAN",
      content: `Around 2009, Christopher met the Los Angeles-based hip hop collective Odd Future through networking. His friendship with Tyler, The Creator reinvigorated his songwriting and encouraged him to write for himself rather than just other artists. That same year, he met producer Christopher "Tricky" Stewart, who helped him sign a contract with Def Jam Recordings as a solo artist.

In 2010, through a legal website, he officially changed his name from Christopher Breaux to Christopher Francis Ocean. The name was inspired by Frank Sinatra and the 1960 film Ocean's Eleven, believing the new name would look better on magazine covers.

But Def Jam wasn't supportive of his artistic vision. Frustrated by the label's lack of promotion, Frank made a bold move: in February 2011, he self-released his mixtape "Nostalgia, Ultra" as a free download on his Tumblr site, without Def Jam's knowledge. The recording featured both original compositions and creative samples from artists like Coldplay, the Eagles, and MGMT.`
    },
    {
      id: "breakthrough",
      title: "THE LETTER THAT CHANGED EVERYTHING",
      content: `On July 4, 2012, on the eve of releasing his debut studio album "Channel Orange," Frank Ocean published an open letter on his Tumblr blog. What was initially intended as liner notes became one of music's most powerful moments of vulnerability. Frank detailed his first love - who happened to be a man - when he was 19 years old.

In the letter, Frank wrote with raw honesty about this relationship: "By the time I realized I was in love, it was malignant. It was hopeless... He wouldn't tell me the truth about his feelings for me for another three years." The letter's transparency sent ripples through hip-hop culture and beyond.

This act of radical tenderness came at a time when hip-hop culture was still grappling with homophobia. Frank's letter represented what one critic called "the most radical form of expression in a world that asks you to present your most uncaring self was tenderness."

"Channel Orange" was released shortly after and debuted at number two on the Billboard 200. The album won the Grammy for Best Urban Contemporary Album and established Frank as a pioneer of alternative R&B, with standout tracks like "Thinkin Bout You," "Super Rich Kids," and "Pink Matter."`
    },
    {
      id: "legacy",
      title: "THE CULTURAL IMPACT",
      content: `Frank Ocean's influence extends far beyond music. His approach to vulnerability and emotional honesty has inspired countless artists including Tyler, The Creator, Billie Eilish, and James Blake. He demonstrated that an artist could maintain mystique while being radically honest about their inner life.

Despite releasing only two studio albums in over a decade, Frank maintains 20 million monthly Spotify listeners. His music represents what one critic described as "the emotional equivalent of being invited to sit in silence next to someone in a dark room, looking out a window over a cityscape and listening to your inner dialogue."

Frank Ocean proved that in the streaming era, an artist could still create albums as integral artistic statements. His use of enigma, silence, and carefully curated releases turned his work into cultural phenomena rather than just products.

His legacy lives in the spaces between: between R&B and avant-garde, between presence and absence, between what music is and what it could be. In a world of constant noise, Frank Ocean showed the power of silence, patience, and vulnerability as strength.`
    }
  ]
};

export default function FrankOceanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('journey');
  const [showStory, setShowStory] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue(prev => (prev + 0.2) % 360);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const backgroundStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at ${30 + Math.sin(hue * 0.015) * 20}% ${40 + Math.cos(hue * 0.012) * 15}%, 
        hsla(${200 + Math.sin(hue * 0.008) * 30}, 80%, 60%, 0.3) 0%, transparent 50%),
      radial-gradient(circle at ${70 + Math.sin((hue + 160) * 0.018) * 25}% ${60 + Math.cos((hue + 200) * 0.015) * 20}%, 
        hsla(${240 + Math.sin((hue + 120) * 0.01) * 25}, 85%, 65%, 0.25) 0%, transparent 45%),
      linear-gradient(135deg, 
        hsl(${220 + Math.sin(hue * 0.006) * 15}, 75%, 20%) 0%, 
        hsl(${180 + Math.sin((hue + 100) * 0.008) * 20}, 70%, 25%) 50%,
        hsl(${240 + Math.sin((hue + 200) * 0.009) * 18}, 65%, 18%) 100%)`
  }), [hue]);

  const tabs = [
    { id: 'journey', label: "Frank's Journey", icon: ClockIcon, description: 'Interactive timeline of his musical odyssey' },
    { id: 'discography', label: 'Musical Creations', icon: MusicalNoteIcon, description: 'Albums, singles, and hidden gems' },
    { id: 'impact', label: 'Cultural Legacy', icon: SparklesIcon, description: 'How Frank changed music forever' },
    { id: 'sources', label: 'Research Sources', icon: LinkIcon, description: 'Verified journalism and interviews' }
  ];

  const currentSectionData = frankOceanStory.sections[currentSection];

  const nextSection = () => {
    if (currentSection < frankOceanStory.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleEnterJourney = () => {
    setShowStory(true);
    setCurrentSection(0);
  };

  return (
    <div className="min-h-screen text-white font-sans" style={backgroundStyle}>
      {/* Floating musical elements */}
      <FloatingNotesLayer count={12} layer="background" />
      <FloatingNotesLayer count={8} layer="foreground" />
      
      {/* Header with back navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Artists</span>
          </button>
          
          <div className="text-sm text-white/60">
            TuneTales • Artist Deep Dive
          </div>
        </div>
      </header>

      {/* Story Modal - NEW ADDITION */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowStory(false)}
        >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Story Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">{frankOceanStory.title}</h2>
                  <span className="text-blue-200">
                    {currentSection + 1} of {frankOceanStory.sections.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowStory(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pt-4">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-blue-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSection + 1) / frankOceanStory.sections.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {currentSectionData.title}
                    </h3>
                    
                    <div className="text-white/90 leading-relaxed text-lg space-y-4">
                      {currentSectionData.content}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center p-6 border-t border-white/10">
                <motion.button
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                    currentSection === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/20'
                  }`}
                  whileHover={currentSection > 0 ? { scale: 1.05 } : {}}
                >
                  Previous
                </motion.button>

                <div className="flex space-x-2">
                  {frankOceanStory.sections.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentSection(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentSection ? 'bg-blue-400' : 'bg-white/30'
                      }`}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={nextSection}
                  disabled={currentSection === frankOceanStory.sections.length - 1}
                  className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                    currentSection === frankOceanStory.sections.length - 1
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  whileHover={currentSection < frankOceanStory.sections.length - 1 ? { scale: 1.05 } : {}}
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Artist Image */}
            <div className="relative inline-block mb-8">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-2xl shadow-blue-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60" 
                  alt="Frank Ocean"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-teal-400/20 blur-xl animate-pulse" />
            </div>

            {/* Artist Name & Stats */}
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                Frank Ocean
              </span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-6 text-white/80 mb-8">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>20M+ Monthly Listeners</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>2005 - Present</span>
              </div>
              <div className="flex items-center space-x-2">
                <MusicalNoteIcon className="w-5 h-5" />
                <span>Alternative R&B Pioneer</span>
              </div>
            </div>

            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              The enigmatic artist who redefined vulnerability in music, broke barriers for LGBTQ+ representation, 
              and created some of the most influential albums of the 21st century.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-20 z-30 bg-black/40 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex justify-center space-x-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10 shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {tab.description}
                  </div>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-[60vh]"
        >
          {activeTab === 'journey' && !showStory && (
            <div className="text-center py-20">
              <div className="mb-8">
                <SparklesIcon className="w-24 h-24 mx-auto text-blue-400 mb-6" />
                <h2 className="text-4xl font-bold mb-4">Frank's Musical Odyssey</h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Dive deep into the meticulously researched story of Christopher Breaux's transformation 
                  into one of music's most enigmatic artists.
                </p>
              </div>
              
              <motion.button
                onClick={handleEnterJourney}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
              >
                <PlayIcon className="w-6 h-6 mr-3" />
                Enter the Journey
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
              </motion.button>
              
              <div className="mt-12 text-sm text-white/50">
                Based on comprehensive research from premium music journalism sources
              </div>
            </div>
          )}

          {activeTab === 'journey' && showStory && (
            <div className="text-center py-20">
              <div className="text-white/50">
                Reading Frank's story in the modal above
              </div>
            </div>
          )}

          {activeTab === 'discography' && (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-6">Musical Creations</h2>
              <p className="text-xl text-white/70 mb-8">
                Explore Frank's complete catalog of albums, singles, and rare gems
              </p>
              <div className="text-white/50">
                Coming Soon: Interactive discography with song bubbles
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-6">Cultural Legacy</h2>
              <p className="text-xl text-white/70 mb-8">
                How Frank Ocean changed music, culture, and representation forever
              </p>
              <div className="text-white/50">
                Coming Soon: Interactive impact visualization
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-6">Research Sources</h2>
              <p className="text-xl text-white/70 mb-8">
                All information verified through credible journalism and official sources
              </p>
              <div className="text-white/50">
                Complete source attribution and research methodology
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
    </div>
  );
}