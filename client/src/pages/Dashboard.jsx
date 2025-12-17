import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import FitScoreBadge from '../components/FitScoreBadge';
import { Trash2, MapPin } from 'lucide-react';
import { shortlistAPI } from '../services/api';

const Dashboard = () => {
    const { user, updateUser } = useAuth();

    const handleRemove = async (uniId) => {
        if (!window.confirm("Remove from shortlist?")) return;
        try {
            await shortlistAPI.remove(uniId);
            window.location.reload();
        } catch (error) {
            console.error("Failed to remove", error);
        }
    };

    const handleStatusChange = async (uniId, newStatus) => {
        try {
            await shortlistAPI.updateStatus(uniId, { applicationStatus: newStatus });
            window.location.reload();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    if (!user) return <div className="p-10">Please login</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                <p className="text-slate-600">Welcome back, {user.profile?.firstName}!</p>
            </div>

            <section>
                {(() => {
                    const validShortlist = user.shortlistedUniversities?.filter(item => item.university) || [];

                    return (
                        <>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                Shortlisted Universities
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    {validShortlist.length}
                                </span>
                            </h2>

                            {validShortlist.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {validShortlist.map((item) => {
                                        const uni = item.university;
                                        return (
                                            <div key={uni._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                                {/* Card Header/Image */}
                                                <div className="relative h-40 bg-slate-100">
                                                    {uni.images && uni.images[0] ? (
                                                        <img src={uni.images[0]} alt={uni.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                            <span className="text-4xl">🏛️</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <FitScoreBadge score={item.fitScore} />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(uni._id)}
                                                        className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="p-5 flex flex-col flex-grow">
                                                    <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1" title={uni.name}>{uni.name}</h3>

                                                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-500">
                                                        <MapPin size={14} />
                                                        {uni.city}, {uni.country}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                                        <div className="bg-slate-50 p-2 rounded">
                                                            <div className="text-slate-500">Global Rank</div>
                                                            <div className="font-semibold">#{uni.ranking?.global || 'N/A'}</div>
                                                        </div>
                                                        <div className="bg-slate-50 p-2 rounded">
                                                            <div className="text-slate-500">Tuition</div>
                                                            <div className="font-semibold">
                                                                {uni.financials?.tuitionFee?.international?.currency} {uni.financials?.tuitionFee?.international?.min?.toLocaleString() || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                                                        <select
                                                            value={item.applicationStatus}
                                                            onChange={(e) => handleStatusChange(uni._id, e.target.value)}
                                                            className={`text-xs font-semibold px-2 py-1.5 rounded border-0 cursor-pointer focus:ring-1 focus:ring-blue-500 flex-grow ${item.applicationStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                                                                item.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                    'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                            {['Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted'].map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                        <Link to={`/application/${uni._id}`} className="text-blue-600 text-sm font-medium hover:underline whitespace-nowrap">
                                                            Manage App →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 mb-4">You haven't shortlisted any universities yet.</p>
                                    <Link to="/" className="btn-primary">Find Universities</Link>
                                </div>
                            )}
                        </>
                    );
                })()}
            </section>
        </div>
    );
};

export default Dashboard;
