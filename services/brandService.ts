import type { Brand } from '../types.ts';

// This is a curated list of MCU films in release order to ensure accuracy
// for the brand hub, instead of relying on a broad company ID search.
const mcuMediaIds: Brand['mediaIds'] = [
    // Phase One
    { id: 1726, type: 'movie' },   // Iron Man (2008)
    { id: 1724, type: 'movie' },   // The Incredible Hulk (2008)
    { id: 10138, type: 'movie' },  // Iron Man 2 (2010)
    { id: 10195, type: 'movie' },  // Thor (2011)
    { id: 1771, type: 'movie' },   // Captain America: The First Avenger (2011)
    { id: 24428, type: 'movie' },  // The Avengers (2012)
    // Phase Two
    { id: 68721, type: 'movie' },  // Iron Man 3 (2013)
    { id: 76338, type: 'movie' },  // Thor: The Dark World (2013)
    { id: 100402, type: 'movie' }, // Captain America: The Winter Soldier (2014)
    { id: 118340, type: 'movie' }, // Guardians of the Galaxy (2014)
    { id: 99861, type: 'movie' },  // Avengers: Age of Ultron (2015)
    { id: 102899, type: 'movie' }, // Ant-Man (2015)
    // Phase Three
    { id: 271110, type: 'movie' }, // Captain America: Civil War (2016)
    { id: 284054, type: 'movie' }, // Doctor Strange (2016)
    { id: 283995, type: 'movie' }, // Guardians of the Galaxy Vol. 2 (2017)
    { id: 315635, type: 'movie' }, // Spider-Man: Homecoming (2017)
    { id: 284053, type: 'movie' }, // Thor: Ragnarok (2017)
    { id: 284052, type: 'movie' }, // Black Panther (2018)
    { id: 299536, type: 'movie' }, // Avengers: Infinity War (2018)
    { id: 363088, type: 'movie' }, // Ant-Man and the Wasp (2018)
    { id: 299537, type: 'movie' }, // Captain Marvel (2019)
    { id: 299534, type: 'movie' }, // Avengers: Endgame (2019)
    { id: 429617, type: 'movie' }, // Spider-Man: Far From Home (2019)
    // Phase Four
    { id: 85271, type: 'tv' },     // WandaVision (2021)
    { id: 88396, type: 'tv' },     // The Falcon and the Winter Soldier (2021)
    { id: 84958, type: 'tv' },     // Loki (2021)
    { id: 497698, type: 'movie' }, // Black Widow (2021)
    { id: 91363, type: 'tv' },     // What If...? (2021)
    { id: 566525, type: 'movie' }, // Shang-Chi and the Legend of the Ten Rings (2021)
    { id: 524434, type: 'movie' }, // Eternals (2021)
    { id: 88329, type: 'tv' },     // Hawkeye (2021)
    { id: 634649, type: 'movie' }, // Spider-Man: No Way Home (2021)
    { id: 92749, type: 'tv' },     // Moon Knight (2022)
    { id: 453395, type: 'movie' }, // Doctor Strange in the Multiverse of Madness (2022)
    { id: 92782, type: 'tv' },     // Ms. Marvel (2022)
    { id: 616037, type: 'movie' }, // Thor: Love and Thunder (2022)
    { id: 113461, type: 'tv' },    // I Am Groot (2022)
    { id: 92783, type: 'tv' },     // She-Hulk: Attorney at Law (2022)
    { id: 96521, type: 'movie' },  // Werewolf by Night (2022)
    { id: 505642, type: 'movie' }, // Black Panther: Wakanda Forever (2022)
    { id: 89420, type: 'movie' },  // The Guardians of the Galaxy Holiday Special (2022)
    // Phase Five
    { id: 640146, type: 'movie' }, // Ant-Man and the Wasp: Quantumania (2023)
    { id: 447365, type: 'movie' }, // Guardians of the Galaxy Vol. 3 (2023)
    { id: 114472, type: 'tv' },    // Secret Invasion (2023)
    { id: 609681, type: 'movie' }, // The Marvels (2023)
    { id: 102143, type: 'tv' }     // Echo (2024)
];

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
        posterUrl: 'https://theposterdb.com/api/assets/4362', 
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
        posterUrl: 'https://theposterdb.com/api/assets/393659', 
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
        posterUrl: 'https://theposterdb.com/api/assets/393675', 
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
        posterUrl: 'https://theposterdb.com/api/assets/393657', 
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

const dcMediaIds: Brand['mediaIds'] = [
    // DCEU
    { id: 49521, type: 'movie' },   // Man of Steel (2013)
    { id: 209112, type: 'movie' }, // Batman v Superman: Dawn of Justice (2016)
    { id: 297761, type: 'movie' }, // Suicide Squad (2016)
    { id: 297762, type: 'movie' }, // Wonder Woman (2017)
    { id: 141052, type: 'movie' }, // Justice League (2017)
    { id: 297802, type: 'movie' }, // Aquaman (2018)
    { id: 287947, type: 'movie' },  // Shazam! (2019)
    { id: 495764, type: 'movie' }, // Birds of Prey (2020)
    { id: 464052, type: 'movie' }, // Wonder Woman 1984 (2020)
    { id: 791373, type: 'movie' }, // Zack Snyder's Justice League (2021)
    { id: 436969, type: 'movie' }, // The Suicide Squad (2021)
    { id: 436270, type: 'movie' }, // Black Adam (2022)
    { id: 594767, type: 'movie' }, // Shazam! Fury of the Gods (2023)
    { id: 298618, type: 'movie' }, // The Flash (2023)
    { id: 565770, type: 'movie' }, // Blue Beetle (2023)
    { id: 572802, type: 'movie' }, // Aquaman and the Lost Kingdom (2023)
    
    // The Dark Knight Trilogy
    { id: 272, type: 'movie' },    // Batman Begins (2005)
    { id: 155, type: 'movie' },    // The Dark Knight (2008)
    { id: 49026, type: 'movie' },  // The Dark Knight Rises (2012)

    // Elseworlds / Standalone
    { id: 414906, type: 'movie' }, // The Batman (2022)
    { id: 475557, type: 'movie' }, // Joker (2019)
    { id: 752, type: 'movie' },    // V for Vendetta (2006)
    { id: 13183, type: 'movie' },  // Watchmen (2009)
];

const dcCharacterCollections: Brand['characterCollections'] = [
    {
        id: 263, // The Dark Knight Trilogy
        name: 'The Dark Knight Trilogy',
        posterUrl: 'https://image.tmdb.org/t/p/w500/lPEDA4lI2t272W8fEmu04uSjK01.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/uVy02pL7pWOQB2Z0Yt2fAgCKK3.jpg',
    },
    {
        id: 100001, // Custom Batman collection
        name: 'Modern Batman',
        posterUrl: 'https://image.tmdb.org/t/p/w500/7aB4i2j2N3m9lkoT5tFz2b0S94S.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/dppnMubP2Gj2aK412x29pLQmAuS.jpg',
        mediaIds: [
            { id: 414906, type: 'movie' }, // The Batman
            { id: 209112, type: 'movie' }, // BvS
            { id: 141052, type: 'movie' }, // Justice League
            { id: 791373, type: 'movie' }, // ZSJL
        ]
    },
    {
        id: 468552, // Wonder Woman Collection
        name: 'Wonder Woman Collection',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8BsdQKy2v3iJ2EdA525T9f4L22a.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/yFBd4K2trCOiVb4kL4K2aY2S6dG.jpg',
    },
    {
        id: 100002, // Custom Superman collection
        name: 'Modern Superman',
        posterUrl: 'https://image.tmdb.org/t/p/w500/lrsOFzkR7N2JzE3j3p6bO2kG0I.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7msIZiG295l1ftN2B5vjSjvxN15.jpg',
        mediaIds: [
            { id: 49521, type: 'movie' }, // Man of Steel
            { id: 209112, type: 'movie' }, // BvS
            { id: 141052, type: 'movie' }, // Justice League
            { id: 791373, type: 'movie' }, // ZSJL
        ]
    }
];

// FIX: Add a curated list of all Wizarding World movies to ensure both Harry Potter and Fantastic Beasts are included reliably.
const wizardingWorldMediaIds: Brand['mediaIds'] = [
    // Harry Potter Series
    { id: 671, type: 'movie' },   // Harry Potter and the Sorcerer's Stone (2001)
    { id: 672, type: 'movie' },   // Harry Potter and the Chamber of Secrets (2002)
    { id: 673, type: 'movie' },   // Harry Potter and the Prisoner of Azkaban (2004)
    { id: 674, type: 'movie' },   // Harry Potter and the Goblet of Fire (2005)
    { id: 675, type: 'movie' },   // Harry Potter and the Order of the Phoenix (2007)
    { id: 767, type: 'movie' },    // Harry Potter and the Half-Blood Prince (2009)
    { id: 12444, type: 'movie' }, // Harry Potter and the Deathly Hallows: Part 1 (2010)
    { id: 12445, type: 'movie' }, // Harry Potter and the Deathly Hallows: Part 2 (2011)
    // Fantastic Beasts Series
    { id: 259316, type: 'movie' }, // Fantastic Beasts and Where to Find Them (2016)
    { id: 338952, type: 'movie' }, // Fantastic Beasts: The Crimes of Grindelwald (2018)
    { id: 338953, type: 'movie' }, // Fantastic Beasts: The Secrets of Dumbledore (2022)
];

export const brands: Brand[] = [
  {
    id: 'backtothefuture',
    name: 'Back to the Future',
    // FIX: Add missing 'posterUrl' property to satisfy the Brand type.
    posterUrl: '', // Not used when logoUrl is present, but required by type.
    logoUrl: 'https://cdn.brandfetch.io/idVlDHLrJU/w/420/h/240/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1754259230882',
    bgColor: '#FFC700',
    borderColor: '#E6DB74',
    hoverGifUrl: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHNoOWdiZnN6bDR6eGwwOTEzMnN2ejdvMGM4aTJlb3VycWV6dWlxNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yXaLp6DtmZ1HJPXFlG/giphy.gif',
    characterCollections: [],
    collectionIds: [264], // Back to the Future Collection
    defaultSort: 'timeline',
  },
  {
    id: 'dc',
    name: 'DC',
    posterUrl: '', // Not used when logoUrl is present
    logoUrl: 'https://cdn.brandfetch.io/idnLU4lJS1/w/313/h/313/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1722965181273',
    backdropUrl: 'https://cdn.brandfetch.io/idnLU4lJS1/w/313/h/313/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1722965181273',
    bgColor: '#0074E8',
    borderColor: '#FFFFFF',
    hoverGifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2J0cXNiYzgweXo1OWNsNHBidWljaHNja2NmNG41cjZ3b2RkMWZqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o14r7I9oazFSJ0AILr/giphy.gif',
    mediaIds: dcMediaIds,
    characterCollections: dcCharacterCollections,
    defaultSort: 'timeline',
  },
  {
    id: 'fastandfurious',
    name: 'Fast & Furious',
    posterUrl: '', // Not used when logoUrl is present, but required by type.
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/The-fast-and-the-furious-4.png',
    bgColor: '#FFFFFF',
    borderColor: '#000000',
    hoverGifUrl: '',
    characterCollections: [],
    collectionIds: [9485], // The Fast and the Furious Collection
    defaultSort: 'timeline',
  },
  {
    id: 'ghostbusters',
    name: 'Ghostbusters',
    posterUrl: '', // Not used when logoUrl is present, but required by type.
    logoUrl: 'https://www.freepnglogos.com/uploads/ghostbusters-png-logo/ghostbusters-png-logo-symbol-4.png',
    bgColor: '#FFFFFF',
    borderColor: '#ea0000',
    hoverGifUrl: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWsxMGpqMmFpbHprcm53emI4YjZ4bXUxMnpwbDJrbGhvdzNmODNlbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RGAtt9ljyN79RMORNj/giphy.gif',
    characterCollections: [],
    collectionIds: [2831], // Ghostbusters Collection
    defaultSort: 'timeline',
  },
  {
    id: 'jamesbond',
    name: 'James Bond',
    posterUrl: '', // Not used when logoUrl is present, but required by type.
    logoUrl: 'https://images.seeklogo.com/logo-png/0/1/james-bond-007-logo-png_seeklogo-58.png',
    bgColor: '#FFFFFF',
    borderColor: '#FFD700',
    hoverGifUrl: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHl2eDV5YTc4M25ldm56bGZiMm5oMmRnbGUydGQ3Nm54ZjF2aWxvNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uuRFi1O4aEH0qVR0wJ/giphy.gif',
    characterCollections: [],
    collectionIds: [645], // James Bond Collection
    defaultSort: 'timeline',
  },
  {
    id: 'johnwick',
    name: 'John Wick',
    posterUrl: '', // Not used when logoUrl is present, but required by type.
    logoUrl: 'https://www.pngplay.com/wp-content/uploads/12/John-Wick-PNG-Clipart-Background-HD.png',
    bgColor: '#C9027B',
    borderColor: '#A8246A',
    hoverGifUrl: '',
    characterCollections: [],
    collectionIds: [531241], // John Wick Collection
    defaultSort: 'timeline',
  },
  {
    id: 'jurassic',
    name: 'Jurassic Park',
    posterUrl: 'https://image.tmdb.org/t/p/original/njFixYzIxX8jsn6KMSEtAzi4avi.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/njFixYzIxX8jsn6KMSEtAzi4avi.jpg',
    characterCollections: [],
    collectionIds: [328, 529891], // Jurassic Park Collection & Jurassic World Collection
    defaultSort: 'timeline',
  },
  {
    id: 'marvel',
    name: 'Marvel',
    posterUrl: '', // Not used when logoUrl is present
    logoUrl: 'https://cdn.brandfetch.io/idXjyYbtab/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1749703638456',
    bgColor: '#202020',
    borderColor: '#EC1D24',
    hoverGifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW8wdWdyMDNycGxucGVhcXByZ2hhMjQ2amJ6bDY0NjcyajVoajY5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IhOZQhKKVkQyCvYRSS/giphy.gif',
    mediaIds: mcuMediaIds, // Keep curated list for MCU accuracy
    characterCollections: marvelCharacterCollections,
    defaultSort: 'timeline',
  },
  {
    id: 'missionimpossible',
    name: 'Mission: Impossible',
    posterUrl: '', // Not used when logoUrl is present
    logoUrl: 'https://static.wikia.nocookie.net/logopedia/images/7/75/Img_0940.png/revision/latest?cb=20160718234043',
    bgColor: '#000000',
    borderColor: '#D14836',
    hoverGifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG90cDQzaDhrZjlmeDFmbW5lbTY2d29kZ3VpcW1zN3dpaDdkOW91aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7q3By1tKdxjJ6/giphy.gif',
    characterCollections: [],
    collectionIds: [87359], // Mission: Impossible Collection
    defaultSort: 'timeline',
  },
  {
    id: 'starwars',
    name: 'Star Wars',
    posterUrl: 'https://image.tmdb.org/t/p/original/trf3Hi3tPOJARsCBoVMDBlpjPC4.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/trf3Hi3tPOJARsCBoVMDBlpjPC4.jpg',
    characterCollections: [],
    collectionIds: [10], // Star Wars Collection
    defaultSort: 'timeline',
  },
  {
    id: 'terminator',
    name: 'Terminator',
    posterUrl: 'https://image.tmdb.org/t/p/original/lDhKuzL8l29nsc6IKWH1odl66SK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/lDhKuzL8l29nsc6IKWH1odl66SK.jpg',
    characterCollections: [],
    collectionIds: [528], // The Terminator Collection
    defaultSort: 'timeline',
  },
  {
    id: 'wizardingworld',
    name: 'Wizarding World',
    posterUrl: 'https://i.vimeocdn.com/video/741739046-36b4195f4e1f8d856a989d58ebb9973af16e630d57bf400434b2a37a8319d5d8-d?f=webp',
    backdropUrl: 'https://i.vimeocdn.com/video/741739046-36b4195f4e1f8d856a989d58ebb9973af16e630d57bf400434b2a37a8319d5d8-d?f=webp',
    characterCollections: [],
    // FIX: Replaced collectionIds with a more reliable, curated list of mediaIds to ensure all films are included.
    mediaIds: wizardingWorldMediaIds,
    defaultSort: 'timeline',
  }
];