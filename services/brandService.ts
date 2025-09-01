import type { Brand } from '../types.ts';

const MARVEL_COMPANY_ID = 420;

const marvelCharacterCollections: Brand['characterCollections'] = [
    { 
        id: 131292, 
        name: 'Iron Man Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/fbeJ7f0aD4A112Bc1tnpzyn82xO.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/rI8zOWkRQJdlAyQ6WJOSlYK6JxZ.jpg',
        mediaIds: [
            { id: 1726, type: 'movie' },   // Iron Man
            { id: 10138, type: 'movie' },  // Iron Man 2
            { id: 68721, type: 'movie' },  // Iron Man 3
            { id: 24428, type: 'movie' },  // The Avengers
            { id: 99861, type: 'movie' },  // Avengers: Age of Ultron
            { id: 271110, type: 'movie' }, // Captain America: Civil War
            { id: 315635, type: 'movie' }, // Spider-Man: Homecoming
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
        ]
    },
    { 
        id: 86062, 
        name: 'Hulk Collection', 
        posterUrl: 'https://images.theposterdb.com/prod/public/images/posters/optimized/collections/4702/UHMyXvRn4B0BRHx7gLdALkxrUABUtqdp0el2ig86.webp', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/p3rKiC2yMW6R2O2sV1gI2btrj3x.jpg',
        mediaIds: [
            { id: 1724, type: 'movie' },   // The Incredible Hulk
            { id: 24428, type: 'movie' },  // The Avengers
            { id: 99861, type: 'movie' },  // Avengers: Age of Ultron
            { id: 284053, type: 'movie' }, // Thor: Ragnarok
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 92783, type: 'tv' },     // She-Hulk: Attorney at Law
        ]
    },
    { 
        id: 131296, 
        name: 'Captain America Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/2tOgiY533JSFp7OrVlkeRJvsZpI.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/7kVucUYqz8fZkOmFtA8opDwJFXM.jpg',
        mediaIds: [
            { id: 1771, type: 'movie' },   // Captain America: The First Avenger
            { id: 100402, type: 'movie' }, // Captain America: The Winter Soldier
            { id: 271110, type: 'movie' }, // Captain America: Civil War
            { id: 24428, type: 'movie' },  // The Avengers
            { id: 99861, type: 'movie' },  // Avengers: Age of Ultron
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 88396, type: 'tv' },     // The Falcon and the Winter Soldier
        ]
    },
    { 
        id: 131295, 
        name: 'Thor Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w220_and_h330_face/1fGblAmaE2wU6ts2A83eWBgkmHs.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/bH86CbUSgkQ08zKhXcbODVHdi8yi.jpg',
        mediaIds: [
            { id: 10195, type: 'movie' },  // Thor
            { id: 24428, type: 'movie' },  // The Avengers
            { id: 76338, type: 'movie' },  // Thor: The Dark World
            { id: 99861, type: 'movie' },  // Avengers: Age of Ultron
            { id: 284053, type: 'movie' }, // Thor: Ragnarok
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 616037, type: 'movie' }, // Thor: Love and Thunder
            { id: 91363, type: 'tv' },     // What If...?
        ]
    },
    { 
        id: 86311, 
        name: 'The Avengers Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w220_and_h330_face/yaC8DTvarpMU5QsOiLVgATIMovp.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/w500_and_h282_face/smLccpWC4ElF5xyjD99bZu2gna.jpg',
        mediaIds: [
            { id: 24428, type: 'movie' },  // The Avengers
            { id: 99861, type: 'movie' },  // Avengers: Age of Ultron
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
        ]
    },
    { 
        id: 529892, 
        name: 'Ant-Man Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/9T5WHb6IxsTRs28hG1mEW3bLd1b.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/6XN1v8mI8d2Vzdk4A6sS7n25bBF.jpg',
        mediaIds: [
            { id: 102899, type: 'movie' }, // Ant-Man
            { id: 271110, type: 'movie' }, // Captain America: Civil War
            { id: 363088, type: 'movie' }, // Ant-Man and the Wasp
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 640146, type: 'movie' }, // Ant-Man and the Wasp: Quantumania
        ]
    },
    { 
        id: 86032, 
        name: 'Doctor Strange Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/v15s9Y0bsYo0i76aB5A2aN2l78i.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/7s932SSa5aY513a9p6a2jyrfLz8.jpg',
        mediaIds: [
            { id: 284054, type: 'movie' }, // Doctor Strange
            { id: 284053, type: 'movie' }, // Thor: Ragnarok
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 634649, type: 'movie' }, // Spider-Man: No Way Home
            { id: 453395, type: 'movie' }, // Doctor Strange in the Multiverse of Madness
        ]
    },
    { 
        id: 529893, 
        name: 'Spider-Man (MCU) Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Vl2gPk5sA02n53Tf2g2kC93s3f.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrC9MyzJbFYSx.jpg',
        mediaIds: [
            { id: 271110, type: 'movie' }, // Captain America: Civil War
            { id: 315635, type: 'movie' }, // Spider-Man: Homecoming
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 429617, type: 'movie' }, // Spider-Man: Far From Home
            { id: 634649, type: 'movie' }, // Spider-Man: No Way Home
        ]
    },
    { 
        id: 529894, 
        name: 'Black Panther Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/yvj3vC6dGvo7E7y2a8g7s4Yx25G.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/4KrgkpHvf7vjHBMwugYbvtlqIRrmwP.jpg',
        mediaIds: [
            { id: 271110, type: 'movie' }, // Captain America: Civil War
            { id: 284052, type: 'movie' }, // Black Panther
            { id: 299536, type: 'movie' }, // Avengers: Infinity War
            { id: 299534, type: 'movie' }, // Avengers: Endgame
            { id: 505642, type: 'movie' }, // Black Panther: Wakanda Forever
        ]
    },
];

export const brands: Brand[] = [
  {
    id: 'marvel',
    name: 'Marvel',
    posterUrl: 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/marvel_studios_in_theaters_art_1_0.jpg',
    companyId: MARVEL_COMPANY_ID,
    characterCollections: marvelCharacterCollections,
    backdropUrl: 'https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/CCC3F8712F781DC1ECDDC406924EF0569A30DB0F0BF628CA9EAF60B97C9ABC4B/compose?aspectRatio=1.78',
  },
  {
    id: 'wizardingworld',
    name: 'Wizarding World',
    posterUrl: 'https://images.ctfassets.net/usf1vwtuqyxm/235FNw3G2zGdw3AjVCR5Z3/78229b35959310850d99032759e5e783/WW_Hero_Desktop_2000x1270_CTA.jpg?w=1200&fit=fill&f=top',
    backdropUrl: 'https://images.alphacoders.com/133/1332794.png',
    characterCollections: [],
    mediaIds: [
      { id: 671, type: 'movie' },    // Harry Potter and the Sorcerer's Stone (2001)
      { id: 672, type: 'movie' },    // Harry Potter and the Chamber of Secrets (2002)
      { id: 673, type: 'movie' },    // Harry Potter and the Prisoner of Azkaban (2004)
      { id: 674, type: 'movie' },    // Harry Potter and the Goblet of Fire (2005)
      { id: 675, type: 'movie' },    // Harry Potter and the Order of the Phoenix (2007)
      { id: 767, type: 'movie' },    // Harry Potter and the Half-Blood Prince (2009)
      { id: 12444, type: 'movie' },  // Harry Potter and the Deathly Hallows: Part 1 (2010)
      { id: 12445, type: 'movie' },  // Harry Potter and the Deathly Hallows: Part 2 (2011)
      { id: 259316, type: 'movie' }, // Fantastic Beasts and Where to Find Them (2016)
      { id: 338952, type: 'movie' }, // Fantastic Beasts: The Crimes of Grindelwald (2018)
      { id: 338953, type: 'movie' }, // Fantastic Beasts: The Secrets of Dumbledore (2022)
    ],
    defaultSort: 'timeline',
  },
  {
    id: 'missionimpossible',
    name: 'Mission: Impossible',
    posterUrl: 'https://www.themoviedb.org/t/p/original/ge2C2gT39bTSoa62A8Rbb2yqa7I.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/jY9efbC2KCa2s0i1Dxd55y13IuI.jpg',
    characterCollections: [],
    mediaIds: [
      { id: 954, type: 'movie' },    // Mission: Impossible (1996)
      { id: 955, type: 'movie' },    // Mission: Impossible 2 (2000)
      { id: 956, type: 'movie' },    // Mission: Impossible III (2006)
      { id: 56292, type: 'movie' },  // Mission: Impossible - Ghost Protocol (2011)
      { id: 177677, type: 'movie' }, // Mission: Impossible - Rogue Nation (2015)
      { id: 353081, type: 'movie' }, // Mission: Impossible - Fallout (2018)
      { id: 575264, type: 'movie' }, // Mission: Impossible - Dead Reckoning Part One (2023)
    ],
    defaultSort: 'timeline',
  },
  {
    id: 'fastandfurious',
    name: 'Fast & Furious',
    posterUrl: 'https://www.themoviedb.org/t/p/original/bOqKESKyEX0T527e0m3i1X9N2f7.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/h3X2p8H34T33Ilo2mo1sD5Vj02L.jpg',
    characterCollections: [],
    mediaIds: [
      { id: 9799, type: 'movie' },   // The Fast and the Furious (2001)
      { id: 584, type: 'movie' },    // 2 Fast 2 Furious (2003)
      { id: 9615, type: 'movie' },   // The Fast and the Furious: Tokyo Drift (2006)
      { id: 13804, type: 'movie' },  // Fast & Furious (2009)
      { id: 51497, type: 'movie' },  // Fast Five (2011)
      { id: 82992, type: 'movie' },  // Fast & Furious 6 (2013)
      { id: 168259, type: 'movie' }, // Furious 7 (2015)
      { id: 337339, type: 'movie' }, // The Fate of the Furious (2017)
      { id: 384018, type: 'movie' }, // Fast & Furious Presents: Hobbs & Shaw (2019)
      { id: 385128, type: 'movie' }, // F9 (2021)
      { id: 385687, type: 'movie' }, // Fast X (2023)
    ],
    defaultSort: 'timeline',
  },
  {
    id: 'jamesbond',
    name: 'James Bond',
    posterUrl: 'https://www.themoviedb.org/t/p/original/dM2w364MScsjFf8pfMbaSSTO1Ze.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/vV5L2vE3xx2v9i4I3e4i0D2sY40.jpg',
    characterCollections: [],
    mediaIds: [
      { id: 646, type: 'movie' },    // Dr. No (1962)
      { id: 657, type: 'movie' },    // From Russia with Love (1963)
      { id: 658, type: 'movie' },    // Goldfinger (1964)
      { id: 660, type: 'movie' },    // Thunderball (1965)
      { id: 667, type: 'movie' },    // You Only Live Twice (1967)
      { id: 668, type: 'movie' },    // On Her Majesty's Secret Service (1969)
      { id: 681, type: 'movie' },    // Diamonds Are Forever (1971)
      { id: 682, type: 'movie' },    // Live and Let Die (1973)
      { id: 691, type: 'movie' },    // The Man with the Golden Gun (1974)
      { id: 698, type: 'movie' },    // The Spy Who Loved Me (1977)
      { id: 699, type: 'movie' },    // Moonraker (1979)
      { id: 700, type: 'movie' },    // For Your Eyes Only (1981)
      { id: 701, type: 'movie' },    // Octopussy (1983)
      { id: 707, type: 'movie' },    // A View to a Kill (1985)
      { id: 708, type: 'movie' },    // The Living Daylights (1987)
      { id: 709, type: 'movie' },    // Licence to Kill (1989)
      { id: 710, type: 'movie' },    // GoldenEye (1995)
      { id: 711, type: 'movie' },    // Tomorrow Never Dies (1997)
      { id: 712, type: 'movie' },    // The World Is Not Enough (1999)
      { id: 713, type: 'movie' },    // Die Another Day (2002)
      { id: 36557, type: 'movie' },  // Casino Royale (2006)
      { id: 10764, type: 'movie' },  // Quantum of Solace (2008)
      { id: 37724, type: 'movie' },  // Skyfall (2012)
      { id: 206647, type: 'movie' }, // Spectre (2015)
      { id: 370172, type: 'movie' }, // No Time to Die (2021)
    ],
    defaultSort: 'timeline',
  }
];
