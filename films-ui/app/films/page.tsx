import Films from '../../components/Films';
import { fetcher } from '../../lib/api';
// import useSWR from 'swr';
// import { useState } from 'react';
// import { useFetchUser } from '../lib/authContext';

const FilmsList = async () => {
  const films = await fetcher(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/films?populate=reviews`,
    { cache: 'no-store' }
  );

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
          The collection
        </p>
        <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
          Films
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Browse stories worth revisiting, from tense heists to epic fantasy.
        </p>
      </div>
      <Films films={films}/>
    </section>
  );
};

export default FilmsList;
