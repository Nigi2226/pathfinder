import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Award, DollarSign, ExternalLink, Globe } from 'lucide-react';
import FitScoreBadge from './FitScoreBadge';

const UniversityCard = ({ university, fitScore }) => {
    const [imgError, setImgError] = useState(false);

    // Fallback image logic
    const handleImgError = () => {
        setImgError(true);
    };

    // Use specific image if available and valid, else generic fallback
    const displayImage = !imgError && university.images && university.images[0]
        ? university.images[0]
        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80";

    return (
        <div className="card group h-full flex flex-col hover:-translate-y-1">
            <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                    src={displayImage}
                    alt={university.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={handleImgError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <div className="absolute top-4 right-4">
                    <FitScoreBadge score={fitScore || university.fitScore} />
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-lg text-white line-clamp-2 drop-shadow-sm leading-tight" title={university.name}>
                        {university.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-200 text-xs mt-1">
                        <MapPin size={12} />
                        <span>{university.city}, {university.country}</span>
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                        <span className="text-slate-500 flex items-center gap-2"><Users size={14} className="text-indigo-500" /> Global Ranking</span>
                        <span className="font-semibold text-slate-700">#{university.ranking?.global}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-slate-50">
                        <span className="text-slate-500 flex items-center gap-2"><DollarSign size={14} className="text-emerald-500" /> Tuition</span>
                        <span className="font-semibold text-slate-700">
                            {university.financials?.tuitionFee?.international?.currency} {university.financials?.tuitionFee?.international?.min?.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                        <span className="text-slate-500 flex items-center gap-2"><Award size={14} className="text-amber-500" /> Acceptance</span>
                        <span className="font-semibold text-slate-700">
                            {university.admissions?.acceptanceRate ? `${(university.admissions.acceptanceRate * 100).toFixed(0)}%` : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-5 gap-3">
                    <Link
                        to={`/university/${university._id}`}
                        className="btn-primary col-span-4 text-center text-sm shadow-indigo-500/20"
                    >
                        View Details
                    </Link>
                    {university.contact?.website && (
                        <a
                            href={university.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-all border border-slate-200 group/link"
                            title="Visit Website"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Globe size={18} className="group-hover/link:scale-110 transition-transform" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversityCard;
