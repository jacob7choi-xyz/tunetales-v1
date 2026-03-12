export interface Artist {
  id: string;
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  status: "active" | "coming-soon";
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
}

export interface ArtistStory {
  title: string;
  sections: StorySection[];
}

export interface ResearchFile {
  metadata: {
    timestamp: string;
    query_type: string;
    artist_name: string;
    model_used: string;
    tokens_used: number;
    cost_estimate: number;
  };
  response: Record<string, unknown>;
}
