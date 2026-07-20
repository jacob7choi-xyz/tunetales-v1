// Album and single artwork for the song odyssey.
// Sources: official streaming CDN art where track IDs are known, and
// Wikipedia-hosted release artwork for everything else. Songs without an
// entry fall back to their act's cover, then to a mood-gradient poster.

export const ACT_COVERS: Record<string, string> = {
  'Nostalgia, Ultra':
    'https://upload.wikimedia.org/wikipedia/en/e/e9/Nostalgia%2CUltra.jpg',
  'Channel Orange':
    'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e027aede4855f6d0d738012e2e5',
  Endless:
    'https://upload.wikimedia.org/wikipedia/en/1/15/Frankoceanendlessart.png',
  Blonde:
    'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02c5649add07ed3720be9d5526',
};

export const SONG_COVERS: Record<string, string> = {
  Chanel: 'https://upload.wikimedia.org/wikipedia/en/7/7c/Frank_Ocean_Chanel_Cover.jpg',
  Biking: 'https://upload.wikimedia.org/wikipedia/en/b/b6/Frank_Ocean_Biking_Cover.jpg',
  Provider: 'https://upload.wikimedia.org/wikipedia/en/c/c0/Frank_Ocean_Provider_Cover.jpg',
  DHL: 'https://upload.wikimedia.org/wikipedia/en/d/d0/Frank_Ocean_-_DHL.png',
  'In My Room': 'https://upload.wikimedia.org/wikipedia/en/5/55/Frank_Ocean_-_In_My_Room.png',
  'Dear April': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Dear_April_Frank_Ocean.jpg',
  Cayendo: 'https://upload.wikimedia.org/wikipedia/en/7/78/Cayendo_Frank_Ocean.jpg',
  'No Church in the Wild (with Jay-Z and Kanye West)':
    'https://upload.wikimedia.org/wikipedia/en/e/ee/Watch_The_Throne.jpg',
  'Made in America (with Jay-Z and Kanye West)':
    'https://upload.wikimedia.org/wikipedia/en/e/ee/Watch_The_Throne.jpg',
  'Oceans (Jay-Z featuring Frank Ocean)':
    'https://upload.wikimedia.org/wikipedia/en/8/87/Magna_Carta_Holy_Grail_cover.png',
  'Slide (Calvin Harris featuring Frank Ocean and Migos)':
    'https://upload.wikimedia.org/wikipedia/en/9/9b/Funk_Wav_Bounces_1.jpg',
  'RAF (A$AP Mob featuring Frank Ocean)':
    'https://upload.wikimedia.org/wikipedia/en/1/18/Cozy_Tapes_Too_Cozy_Cover_art.jpg',
  'Purity (A$AP Rocky featuring Frank Ocean)':
    'https://upload.wikimedia.org/wikipedia/en/6/6a/ASAP_Rocky_Testing.jpg',
  'She (Tyler, the Creator featuring Frank Ocean)':
    'https://upload.wikimedia.org/wikipedia/en/7/7a/Goblincover.jpg',
  'Sunday (Earl Sweatshirt featuring Frank Ocean)':
    'https://upload.wikimedia.org/wikipedia/en/3/39/Doris_vinyl_cover.jpg',
  'Oldie (Odd Future)':
    'https://upload.wikimedia.org/wikipedia/en/f/f3/Odd_Future_Tape_Volume_2_Album_Cover.jpg',
};

export function coverFor(songName: string, actTitle: string): string | null {
  return SONG_COVERS[songName] ?? ACT_COVERS[actTitle] ?? null;
}
