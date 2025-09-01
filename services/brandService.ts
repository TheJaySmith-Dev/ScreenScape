
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
    mediaIds: mcuMediaIds, // Keep curated list for MCU accuracy
    characterCollections: marvelCharacterCollections,
    backdropUrl: 'https://i.postimg.cc/7hXz8npx/Marvel-Studios-Logo.avif',
    defaultSort: 'timeline',
  },
  {
    id: 'wizardingworld',
    name: 'Wizarding World',
    posterUrl: 'https://images.ctfassets.net/usf1vwtuqyxm/235FNw3G2zGdw3AjVCR5Z3/78229b35959310850d99032759e5e783/WW_Hero_Desktop_2000x1270_CTA.jpg?w=1200&fit=fill&f=top',
    backdropUrl: 'https://i.postimg.cc/zX6BLQws/Wizarding-World.avif',
    characterCollections: [],
    collectionIds: [1241, 404609], // Harry Potter Collection & Fantastic Beasts Collection
    defaultSort: 'timeline',
  },
  {
    id: 'missionimpossible',
    name: 'Mission: Impossible',
    posterUrl: 'https://image.tmdb.org/t/p/w1280/j6Y1qjfoJcJ0S3ah9kifbI2bzq0.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/j6Y1qjfoJcJ0S3ah9kifbI2bzq0.jpg',
    characterCollections: [],
    collectionIds: [87359], // Mission: Impossible Collection
    defaultSort: 'timeline',
  },
  {
    id: 'fastandfurious',
    name: 'Fast & Furious',
    posterUrl: 'https://image.tmdb.org/t/p/w1280/abproxa0V1h7BZ2tcZpACkGc8LG.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/abproxa0V1h7BZ2tcZpACkGc8LG.jpg',
    characterCollections: [],
    collectionIds: [9485], // The Fast and the Furious Collection
    defaultSort: 'timeline',
  },
  {
    id: 'jamesbond',
    name: 'James Bond',
    posterUrl: 'https://image.tmdb.org/t/p/w1280/A6N0JJonAz5Gk0trIqvhGOHLSzi.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/A6N0JJonAz5Gk0trIqvhGOHLSzi.jpg',
    characterCollections: [],
    collectionIds: [645], // James Bond Collection
    defaultSort: 'timeline',
  },
  {
    id: 'backtothefuture',
    name: 'Back to the Future',
    posterUrl: 'https://image.tmdb.org/t/p/w1280/x4N74L25pZa7fGIMHe5M8oR0iM3.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/x4N74L25pZa7fGIMHe5M8oR0iM3.jpg',
    characterCollections: [],
    collectionIds: [264], // Back to the Future Collection
    defaultSort: 'timeline',
  },
  {
    id: 'ghostbusters',
    name: 'Ghostbusters',
    posterUrl: 'https://image.tmdb.org/t/p/w1280/u2uS0u32RbtSgN5I1i7s0vX9a4G.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/u2uS0u32RbtSgN5I1i7s0vX9a4G.jpg',
    characterCollections: [],
    collectionIds: [2831], // Ghostbusters Collection
    defaultSort: 'timeline',
  }
];