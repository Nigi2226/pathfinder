import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api';
import { Search, Play, BookOpen, FileText, ExternalLink } from 'lucide-react';

const ResourceLibrary = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchResources();
    }, [category]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await resourceAPI.getAll({ category: category, search: searchQuery });
            if (res.data) {
                setResources(res.data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    const categories = ['All', 'IELTS', 'TOEFL', 'SAT', 'GRE', 'GMAT', 'Essay', 'Visa'];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Library</h1>
                <p className="text-slate-600">Curated materials to help you ace your tests and applications</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearch} className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </form>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading resources...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <div key={resource._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                            <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                                {resource.type === 'Video' ? <Play size={48} className="text-red-500 opacity-80 group-hover:scale-110 transition-transform" /> :
                                    resource.type === 'PDF' ? <FileText size={48} className="text-orange-500 opacity-80 group-hover:scale-110 transition-transform" /> :
                                        <BookOpen size={48} className="text-blue-500 opacity-80 group-hover:scale-110 transition-transform" />}
                                <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide text-slate-500 shadow-sm">
                                    {resource.category}
                                </span>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{resource.title}</h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                                >
                                    Access Material <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceLibrary;
