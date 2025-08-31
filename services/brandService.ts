

import type { Brand } from '../types.ts';

const MARVEL_COMPANY_ID = 420;

const marvelCharacterCollections: Brand['characterCollections'] = [
    { 
        id: 131292, 
        name: 'Iron Man Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w220_and_h330_face/fbeJ7f0aD4A112Bc1tnpzyn82xO.jpg', 
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
    { id: 86062, name: 'Hulk Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/25QZ5wK1y3bH22auO2iW3iA4p3.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/p3rKiC2yMW6R2O2sV1gI2btrj3x.jpg' },
    { 
        id: 131296, 
        name: 'Captain America Collection', 
        posterUrl: 'https://image.tmdb.org/t/p/w220_and_h330_face/2tOgiY533JSFp7OrVlkeRJvsZpI.jpg', 
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
    { id: 131295, name: 'Thor Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/3F4HzC6y25gIFlG3y2GckD1sT3R.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/sI2lH1a02GO6z17t0qgODx1YYxW.jpg' },
    { id: 86311, name: 'The Avengers Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/tYcmmUR1G0i2i5F4t2I1AbLhYQi.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/zuW6fOiusv4X9nnW3paqfXzFlWe.jpg' },
    { id: 529892, name: 'Ant-Man Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/9T5WHb6IxsTRs28hG1mEW3bLd1b.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/6XN1v8mI8d2Vzdk4A6sS7n25bBF.jpg' },
    { id: 86032, name: 'Doctor Strange Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/pMPenpL1t1VOKKECHM5sXBvplfWcwoD4l.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/7s932SSa5aY513a9p6a2jyrfLz8.jpg' },
    { id: 529893, name: 'Spider-Man (MCU) Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/8Vl2gPk5sA02n53Tf2g2kC93s3f.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrC9MyzJbFYSx.jpg' },
    { id: 529894, name: 'Black Panther Collection', posterUrl: 'https://image.tmdb.org/t/p/w500/yvj3vC6dGvo7E7y2a8g7s4Yx25G.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/4KrgkpHvf7vjHnEGWnPCmHjrmwP.jpg' },
];

export const brands: Brand[] = [
  {
    id: 'marvel',
    name: 'Marvel',
    posterUrl: 'https://cdn.theposterdb.com/prod/public/images/posters/optimized/collections/2261/xRGEoY8xur3J56wAavmmyWqfAW0.jpg',
    companyId: MARVEL_COMPANY_ID,
    characterCollections: marvelCharacterCollections
  },
  {
    id: 'backtothefuture',
    name: 'Back to the Future',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gLLfp2AeuaSfjyIcLEMppXggE4U.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 105, type: 'movie' },
        { id: 165, type: 'movie' },
        { id: 196, type: 'movie' },
    ]
  }
];
