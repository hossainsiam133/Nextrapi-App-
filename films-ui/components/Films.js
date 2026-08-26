'use client';

import Link from 'next/link';
import { useState } from 'react';

const getReviewList = (source) => {
    if (Array.isArray(source)) {
        return source;
    }

    if (!source || typeof source !== 'object') {
        return [];
    }

    if (source.review || source.attributes?.review) {
        return [source];
    }

    return getReviewList(source.data ?? source.results ?? source.items);
};

const getReviews = (film) => {
    const reviewSources = [film.attributes?.reviews, film.reviews];

    for (const source of reviewSources) {
        const reviews = getReviewList(source);

        if (reviews.length > 0) {
            return reviews;
        }
    }

    return [];
};

const Films = ({ films }) => {
    const [filmReviews, setFilmReviews] = useState(() => {
        return Object.fromEntries(
            (films?.data ?? []).map((film) => [
                film.id ?? film.documentId,
                getReviews(film),
            ])
        );
    });
    const [formValues, setFormValues] = useState({});
    const [submittingFilm, setSubmittingFilm] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (filmKey, field, value) => {
        setFormValues((current) => ({
            ...current,
            [filmKey]: {
                ...current[filmKey],
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (event, film, filmKey) => {
        event.preventDefault();

        const values = formValues[filmKey] ?? {};
        const review = values.review?.trim();
        const reviewer = values.reviewer?.trim();
        const filmDocumentId = film.documentId ?? film.attributes?.documentId;
        const filmId = film.id ?? film.attributes?.id;

        if (!review || !reviewer) {
            setFormErrors((current) => ({
                ...current,
                [filmKey]: 'Review and reviewer are required.',
            }));
            return;
        }

        setSubmittingFilm(filmKey);
        setFormErrors((current) => ({ ...current, [filmKey]: '' }));

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_URL}/reviews`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: {
                            review,
                            reviewer,
                            Film: {
                                connect: [filmDocumentId ?? filmId],
                            },
                        },
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                const message = response.status === 403
                    ? 'Reviews cannot be added yet. Enable Create for Reviews in Strapi Public permissions.'
                    : result.error?.message || 'Unable to add review.';
                throw new Error(message);
            }

            const createdReview = result.data;
            setFilmReviews((current) => ({
                ...current,
                [filmKey]: [...(current[filmKey] ?? []), createdReview],
            }));
            setFormValues((current) => ({ ...current, [filmKey]: {} }));
        } catch (error) {
            setFormErrors((current) => ({
                ...current,
                [filmKey]: error.message,
            }));
        } finally {
            setSubmittingFilm(null);
        }
    };

    return (
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2">
            {films?.data?.map((film) => {
                const filmData = film.attributes ?? film;

                if (!filmData?.title) {
                    return null;
                }

                const filmTitle = filmData.title;
                const filmKey = film.id ?? film.documentId ?? filmTitle;
                const reviews = filmReviews[filmKey] ?? [];
                const values = formValues[filmKey] ?? {};
                const filmContent = filmData.slug ? (
                    <Link
                        className="transition-colors hover:text-indigo-600"
                        href={`/film/${filmData.slug}`}
                    >
                        {filmTitle}
                    </Link>
                ) : (
                    filmTitle
                );

                return (
                    <li
                        className="group flex min-h-64 flex-col justify-between border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                        key={filmKey}
                    >
                        <div>
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <h2 className="text-2xl font-bold leading-tight text-slate-950">
                                    {filmContent}
                                </h2>
                                <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-indigo-500">
                                    Film
                                </span>
                            </div>
                            <dl className="space-y-2 text-sm text-slate-600">
                                <div className="flex gap-2">
                                    <dt className="font-semibold text-slate-900">Director</dt>
                                    <dd>{filmData.director || 'Unknown'}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="font-semibold text-slate-900">Released</dt>
                                    <dd>{filmData.released || 'Unknown'}</dd>
                                </div>
                            </dl>
                        </div>
                        <p className="mt-8 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
                            {filmData.plot || 'No plot summary available.'}
                        </p>
                        <div className="mt-6 border-t border-slate-200 pt-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                                    Reviews
                                </h3>
                                <span className="text-xs font-semibold text-slate-500">
                                    {reviews.length}
                                </span>
                            </div>
                            {reviews.length > 0 ? (
                                <ul className="space-y-4">
                                    {reviews.map((review, index) => {
                                        const reviewData = review.attributes ?? review;

                                        return (
                                            <li
                                                className="border-l-2 border-indigo-300 pl-3 text-sm"
                                                key={review.id ?? review.documentId ?? `${filmTitle}-review-${index}`}
                                            >
                                                <p className="leading-6 text-slate-700">&ldquo;{reviewData.review}&rdquo;</p>
                                                <p className="mt-1 font-semibold text-slate-500">
                                                    {reviewData.reviewer || 'Anonymous'}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500">No reviews yet.</p>
                            )}
                            <form className="mt-5 space-y-3" onSubmit={(event) => handleSubmit(event, film, filmKey)}>
                                <input
                                    className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                                    onChange={(event) => handleChange(filmKey, 'reviewer', event.target.value)}
                                    placeholder="Your name"
                                    value={values.reviewer ?? ''}
                                />
                                <textarea
                                    className="min-h-20 w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                                    onChange={(event) => handleChange(filmKey, 'review', event.target.value)}
                                    placeholder={`Write a review for ${filmTitle}`}
                                    value={values.review ?? ''}
                                />
                                <button
                                    className="bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={submittingFilm === filmKey}
                                    type="submit"
                                >
                                    {submittingFilm === filmKey ? 'Adding...' : 'Add review'}
                                </button>
                                {formErrors[filmKey] && (
                                    <p className="text-sm text-red-600">{formErrors[filmKey]}</p>
                                )}
                            </form>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default Films;