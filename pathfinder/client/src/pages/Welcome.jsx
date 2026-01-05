import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Users, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 -ml-20 -mb-20"></div>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Side: Branding & Value Prop */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wide uppercase">
                        <Zap size={14} className="fill-blue-700" />
                        Next-Gen Admissions Platform
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight">
                        Shape Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Global Future.</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                        The world's most advanced platform for university discovery, AI-powered applications, and expert mentorship.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Globe className="text-blue-500" size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">1000+ Universities</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <ShieldCheck className="text-indigo-500" size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Verified Experts</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Role Selection Cards */}
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-right duration-1000">
                    {/* Student Card */}
                    <div
                        onClick={() => navigate('/login?role=student')}
                        className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors"></div>
                        <div className="relative z-10 flex gap-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <GraduationCap size={32} />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-2xl font-bold text-slate-900">Student Portal</h2>
                                    <ArrowRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={24} />
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Find dream universities, calculate fit scores, and manage applications with AI assistance.
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Fit Score</span>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">AI Essays</span>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Dashboards</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Counselor Card */}
                    <div
                        onClick={() => navigate('/login?role=consultant')}
                        className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>
                        <div className="relative z-10 flex gap-6">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Users size={32} />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-2xl font-bold text-slate-900">Counselor Portal</h2>
                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={24} />
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Guide students through complex admissions, review documents, and provide expert feedback.
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Collaboration</span>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Bookings</span>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Profiles</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 text-slate-400 text-sm font-medium animate-in fade-in duration-1000 delay-500">
                &copy; {new Date().getFullYear()} PathFinder Global. All rights reserved.
            </div>
        </div>
    );
};

export default Welcome;
