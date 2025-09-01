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
        backdropUrl: 'https://image.tmdb.org/t/p/w500_and_h282_face/smLccpWC4ElF5xyjD9Xt0Zu2gna.jpg',
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
    id: 'starwars',
    name: 'Star Wars',
    posterUrl: 'https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/1691779977299-F723YF4335C2L2221020/the-official-star-wars-timeline-is-getting-a-huge-update-social.jpg',
    backdropUrl: 'https://images.hdqwalls.com/wallpapers/star-wars-the-mandalorian-season-2-5k-ax.jpg',
    companyId: 1, // Lucasfilm
    characterCollections: [
      {
        id: 10,
        name: 'The Skywalker Saga',
        posterUrl: 'https://image.tmdb.org/t/p/w500/oF8d2AaV02QzNE2g6x6k2p5sN5q.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/d8duYyyC9J5T825F7d5D2aXbCZ3.jpg',
        mediaIds: [
          { id: 1893, type: 'movie' }, // Episode I
          { id: 1894, type: 'movie' }, // Episode II
          { id: 1895, type: 'movie' }, // Episode III
          { id: 11, type: 'movie' },   // Episode IV
          { id: 1891, type: 'movie' }, // Episode V
          { id: 1892, type: 'movie' }, // Episode VI
          { id: 140607, type: 'movie' },// Episode VII
          { id: 181808, type: 'movie' },// Episode VIII
          { id: 181812, type: 'movie' },// Episode IX
        ]
      },
    ],
  },
  {
    id: 'dc',
    name: 'DC',
    posterUrl: 'https://cdn.mos.cms.futurecdn.net/pZ5h2o2k5iKmoPgP4t8v9h.jpg',
    backdropUrl: 'https://wallpapercave.com/wp/wp10509312.jpg',
    companyId: 9993, // DC Films
    characterCollections: [
      {
        id: 129,
        name: 'The Dark Knight Trilogy',
        posterUrl: 'https://image.tmdb.org/t/p/w500/3mRQ2zZt2k0Y2rS3DPd2e5i6c6C.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/8hOTu2rPa225bwN4sEHZ3aXy2ko.jpg',
        mediaIds: [
          { id: 272, type: 'movie' },   // Batman Begins
          { id: 155, type: 'movie' },   // The Dark Knight
          { id: 49026, type: 'movie' },  // The Dark Knight Rises
        ]
      },
      {
        id: 263,
        name: 'Wonder Woman Collection',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Baa9hK2TtoKpFB9nOyH5Si1R5O.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/mSLiKnJn121s2y0aXpGg6pP82pF.jpg',
        mediaIds: [
          { id: 297762, type: 'movie' },  // Wonder Woman
          { id: 464052, type: 'movie' },  // Wonder Woman 1984
        ]
      }
    ],
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
  }
];