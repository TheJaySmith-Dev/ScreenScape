
import type { Brand } from '../types.ts';

const MARVEL_COMPANY_ID = 420;

const marvelCharacterCollections: Brand['characterCollections'] = [
    { id: 131292, name: 'Iron Man Collection', posterUrl: 'https://theposterdb.com/api/assets/73396', backdropUrl: 'https://image.tmdb.org/t/p/original/rI8zOWkRQJdlAyQ6WJOSlYK6JxZ.jpg' },
    { id: 86062, name: 'Hulk Collection', posterUrl: 'https://theposterdb.com/api/assets/161837', backdropUrl: 'https://image.tmdb.org/t/p/original/p3rKiC2yMW6R2O2sV1gI2btrj3x.jpg' },
    { id: 131296, name: 'Captain America Collection', posterUrl: 'https://theposterdb.com/api/assets/2900', backdropUrl: 'https://image.tmdb.org/t/p/original/yFuKvT4Vm3sZ1Gbtdjo2z0Rz2Vh.jpg' },
    { id: 131295, name: 'Thor Collection', posterUrl: 'https://theposterdb.com/api/assets/162406', backdropUrl: 'https://image.tmdb.org/t/p/original/sI2lH1a02GO6z17t0qgODx1YYxW.jpg' },
    { id: 86311, name: 'The Avengers Collection', posterUrl: 'https://theposterdb.com/api/assets/29372', backdropUrl: 'https://image.tmdb.org/t/p/original/zuW6fOiusv4X9nnW3paqfXzFlWe.jpg' },
    { id: 529892, name: 'Ant-Man Collection', posterUrl: 'https://image.tmdb.org/t/p/original/9llE4J9sVv8qsvfVGkpugiPTxUV.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/6XN1v8mI8d2Vzdk4A6sS7n25bBF.jpg' },
    { id: 86032, name: 'Doctor Strange Collection', posterUrl: 'https://image.tmdb.org/t/p/original/bm7UlW3ctMJAvD6NNXrCDdRyyKn.jpg', backdropUrl: 'https://image.tmdb.org/t/p/original/7s932SSa5aY513a9p6a2jyrfLz8.jpg' },
    { id: 529893, name: 'Spider-Man (MCU) Collection', posterUrl: 'https://theposterdb.com/api/assets/17324', backdropUrl: 'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrC9MyzJbFYSx.jpg' },
    { id: 529894, name: 'Black Panther Collection', posterUrl: 'https://theposterdb.com/api/assets/17327', backdropUrl: 'https://image.tmdb.org/t/p/original/4KrgkpHvf7vjHnEGWnPCmHjrmwP.jpg' },
];

export const brands: Brand[] = [
  {
    id: 'marvel',
    name: 'Marvel',
    posterUrl: 'https://theposterdb.com/api/assets/584349',
    companyId: MARVEL_COMPANY_ID,
    characterCollections: marvelCharacterCollections
  },
  {
    id: 'backtothefuture',
    name: 'Back to the Future',
    posterUrl: 'https://image.tmdb.org/t/p/original/gLLfp2AeuaSfjyIcLEMppXggE4U.jpg',
    characterCollections: [],
    mediaIds: [
        { id: 105, type: 'movie' },
        { id: 165, type: 'movie' },
        { id: 196, type: 'movie' },
    ]
  }
];
