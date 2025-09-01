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
    posterUrl: 'https://wallpapers.com/images/featured/marvel-logo-3p16v5avq80km4ns.jpg',
    companyId: MARVEL_COMPANY_ID,
    characterCollections: marvelCharacterCollections,
    backdropUrl: 'https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/CCC3F8712F781DC1ECDDC406924EF0569A30DB0F0BF628CA9EAF60B97C9ABC4B/compose?aspectRatio=1.78&format=webp&width=1600'
  },
  {
    id: 'backtothefuture',
    name: 'Back to the Future',
    posterUrl: 'https://image.tmdb.org/t/p/original/5qpt23LxPU68FsQnQJslah4VF6C.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 105, type: 'movie' },
        { id: 165, type: 'movie' },
        { id: 196, type: 'movie' },
    ]
  },
  {
    id: 'ghostbusters',
    name: 'Ghostbusters',
    posterUrl: 'https://image.tmdb.org/t/p/original/tV6ESBQp9bzUZU3swuYYsA94SCR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/c3o5247P3ORfQA322T2p1P9ZDSs.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 620, type: 'movie' },     // Ghostbusters (1984)
        { id: 2978, type: 'movie' },    // Ghostbusters II (1989)
        { id: 425909, type: 'movie' },  // Ghostbusters: Afterlife
        { id: 967847, type: 'movie' },  // Ghostbusters: Frozen Empire
    ]
  },
  {
    id: 'missionimpossible',
    name: 'Mission: Impossible',
    posterUrl: 'https://image.tmdb.org/t/p/w500_and_h282_face/jNjhxBEU3RAdki0xIAZvrsTseZn.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/dJ6yT7vJ2y3fI4T6W7k3upTj8T.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 954, type: 'movie' },     // Mission: Impossible
        { id: 955, type: 'movie' },     // Mission: Impossible 2
        { id: 956, type: 'movie' },     // Mission: Impossible III
        { id: 56292, type: 'movie' },   // Mission: Impossible - Ghost Protocol
        { id: 177677, type: 'movie' },  // Mission: Impossible - Rogue Nation
        { id: 353081, type: 'movie' },  // Mission: Impossible - Fallout
        { id: 575264, type: 'movie' },  // Mission: Impossible - Dead Reckoning Part One
    ]
  },
  {
    id: 'fastandfurious',
    name: 'Fast & Furious',
    posterUrl: 'https://image.tmdb.org/t/p/w500_and_h282_face/abproxa0V1h7BZ2tcZpACkGc8LG.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/h3X1A2G3D2s2k8tTsrD6P7n5S2R.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 9799, type: 'movie' },    // The Fast and the Furious
        { id: 584, type: 'movie' },     // 2 Fast 2 Furious
        { id: 9615, type: 'movie' },    // The Fast and the Furious: Tokyo Drift
        { id: 13804, type: 'movie' },   // Fast & Furious
        { id: 51497, type: 'movie' },   // Fast Five
        { id: 82992, type: 'movie' },   // Fast & Furious 6
        { id: 168259, type: 'movie' },  // Furious 7
        { id: 337339, type: 'movie' },  // The Fate of the Furious
        { id: 384018, type: 'movie' },  // Fast & Furious Presents: Hobbs & Shaw
        { id: 385128, type: 'movie' },  // F9: The Fast Saga
        { id: 385687, type: 'movie' },  // Fast X
    ]
  },
  {
    id: 'jamesbond',
    name: 'James Bond',
    posterUrl: 'https://image.tmdb.org/t/p/original/A6N0JJonAz5Gk0trIqvhGOHLSzi.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/y4aC3nfi1n2aQMy1k2moVqu3b6d.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 646, type: 'movie' },    // Dr. No
        { id: 657, type: 'movie' },    // From Russia with Love
        { id: 658, type: 'movie' },    // Goldfinger
        { id: 660, type: 'movie' },    // Thunderball
        { id: 667, type: 'movie' },    // You Only Live Twice
        { id: 668, type: 'movie' },    // On Her Majesty's Secret Service
        { id: 681, type: 'movie' },    // Diamonds Are Forever
        { id: 253, type: 'movie' },    // Live and Let Die
        { id: 36647, type: 'movie' },  // The Man with the Golden Gun
        { id: 682, type: 'movie' },    // The Spy Who Loved Me
        { id: 691, type: 'movie' },    // Moonraker
        { id: 698, type: 'movie' },    // For Your Eyes Only
        { id: 699, type: 'movie' },    // Octopussy
        { id: 700, type: 'movie' },    // A View to a Kill
        { id: 707, type: 'movie' },    // The Living Daylights
        { id: 708, type: 'movie' },    // Licence to Kill
        { id: 710, type: 'movie' },    // GoldenEye
        { id: 714, type: 'movie' },    // Tomorrow Never Dies
        { id: 718, type: 'movie' },    // The World Is Not Enough
        { id: 720, type: 'movie' },    // Die Another Day
        { id: 36557, type: 'movie' },  // Casino Royale
        { id: 10764, type: 'movie' },  // Quantum of Solace
        { id: 37724, type: 'movie' },  // Skyfall
        { id: 206647, type: 'movie' }, // Spectre
        { id: 370172, type: 'movie' }, // No Time to Die
    ]
  },
  {
    id: 'wizardingworld',
    name: 'Wizarding World',
    posterUrl: 'https://musicart.xboxlive.com/7/b5d65e00-0000-0000-0000-000000000002/504/image.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/5jkE2SzR5uR2egEb1rZGgduFjBN.jpg',
    characterCollections: [
      {
        id: 121, 
        name: 'Harry Potter', 
        posterUrl: 'https://image.tmdb.org/t/p/w500/p3KaBIJAbQo32yOcsfC2s2T2Srr.jpg', 
        backdropUrl: 'https://image.tmdb.org/t/p/original/qWfpSWopkKMCBI0pDi6RDNBqmBa.jpg',
        mediaIds: [
            { id: 671, type: 'movie' },   // and the Philosopher's Stone
            { id: 672, type: 'movie' },   // and the Chamber of Secrets
            { id: 673, type: 'movie' },   // and the Prisoner of Azkaban
            { id: 674, type: 'movie' },   // and the Goblet of Fire
            { id: 675, type: 'movie' },   // and the Order of the Phoenix
            { id: 767, type: 'movie' },   // and the Half-Blood Prince
            { id: 12444, type: 'movie' }, // and the Deathly Hallows: Part 1
            { id: 12445, type: 'movie' }, // and the Deathly Hallows: Part 2
        ]
      },
      {
        id: 404608,
        name: 'Fantastic Beasts',
        posterUrl: 'https://image.tmdb.org/t/p/w500/fTCqgEDe5Flv9a3NnC22L91Cza7.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/3ybt95EcivmtIynUq6kisWsGnEo.jpg',
        mediaIds: [
            { id: 259316, type: 'movie' }, // and Where to Find Them
            { id: 338952, type: 'movie' }, // The Crimes of Grindelwald
            { id: 338954, type: 'movie' }, // The Secrets of Dumbledore
        ]
      }
    ],
  }
];