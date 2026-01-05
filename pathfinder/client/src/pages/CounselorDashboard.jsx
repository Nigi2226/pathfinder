import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Calendar, MessageSquare, ClipboardList, TrendingUp, Search, Filter, Star, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CounselorDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [allStudents, setAllStudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentRes, sessionRes] = await Promise.all([
                    api.get('/students/all'),
                    api.get('/consultations')
                ]);
                setAllStudents(studentRes.data);

                // Filter students who have booked a session
                const bookedStudentIds = new Set(sessionRes.data.map(s => s.student._id));
                const bookedStudents = studentRes.data.filter(s => bookedStudentIds.has(s._id));
                setStudents(bookedStudents);

                setSessions(sessionRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancelSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to cancel this session? The student will be notified.")) return;

        try {
            await api.put(`/consultations/${sessionId}/cancel`);
            addToast('Session cancelled successfully', 'success');
            // Refresh sessions
            const res = await api.get('/consultations');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
            addToast('Failed to cancel session', 'error');
        }
    };

    const stats = [
        { label: 'Active Students', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Avg Rating', value: '4.9', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Sessions', value: sessions.filter(s => s.status === 'Scheduled').length, icon: Calendar, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Hero Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back, {user?.profile?.firstName || 'Counselor'}!</h1>
                    <p className="text-slate-600 max-w-2xl">
                        You have <span className="text-indigo-600 font-bold">{students.length} active students</span> and <span className="text-indigo-600 font-bold">{sessions.filter(s => s.status === 'Scheduled').length} upcoming sessions</span> this week.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Performance Stats</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={18} /></div>
                                    <span className="text-sm font-medium text-slate-600">Acceptance Rate</span>
                                </div>
                                <span className="font-bold text-slate-900">92%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MessageSquare size={18} /></div>
                                    <span className="text-sm font-medium text-slate-600">Total Consultations</span>
                                </div>
                                <span className="font-bold text-slate-900">{sessions.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                        <div className="p-3 bg-white/20 rounded-xl w-fit mb-4"><Calendar size={24} /></div>
                        <h3 className="font-bold text-lg mb-2">Upcoming Schedule</h3>
                        <div className="space-y-3">
                            {sessions.filter(s => s.status === 'Scheduled').slice(0, 3).map(s => (
                                <div key={s._id} className="text-xs border-b border-white/10 pb-2">
                                    <p className="font-bold text-white">{new Date(s.date).toLocaleString()}</p>
                                    <p className="text-blue-100">{s.student?.profile?.firstName} - {s.topic}</p>
                                </div>
                            ))}
                            {sessions.filter(s => s.status === 'Scheduled').length === 0 && (
                                <p className="text-xs text-blue-100">No upcoming sessions.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/consultation')}
                            className="w-full mt-4 py-2 bg-white text-indigo-700 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                </div>

                {/* Main Content: Student List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students by name or major..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/collaboration')}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                            <MessageSquare size={18} /> Messages
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Target & Major</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-slate-500">Loading students...</td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-slate-500">No students found.</td>
                                    </tr>
                                ) : (
                                    students
                                        .filter(s =>
                                            s.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.email.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((student) => (
                                            <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                            {student.profile.firstName[0]}{student.profile.lastName[0]}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-slate-900">{student.profile.firstName} {student.profile.lastName}</div>
                                                            <div className="text-xs text-slate-500">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">{student.interests?.desiredMajor?.[0] || 'Undecided'}</div>
                                                    <div className="text-xs text-slate-500">{student.interests?.preferredStudyDestinations?.[0] || 'TBD'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                    {sessions.find(s => s.student._id === student._id && s.status === 'Scheduled') && (
                                                        <div className="text-[10px] text-slate-400 mt-1 flex flex-col items-end">
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                Payment: {sessions.find(s => s.student._id === student._id && s.status === 'Scheduled').paymentStatus} ({sessions.find(s => s.student._id === student._id && s.status === 'Scheduled').paymentMethod})
                                                            </span>
                                                            <span>TXN: {sessions.find(s => s.student._id === student._id && s.status === 'Scheduled').transactionId}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <button
                                                            onClick={() => navigate(`/collaboration?userId=${student._id}`)}
                                                            className="text-indigo-600 hover:text-indigo-900 font-bold flex items-center gap-1"
                                                        >
                                                            <MessageSquare size={16} /> Message
                                                        </button>
                                                        {sessions.some(s => s.student._id === student._id && s.status === 'Scheduled') && (
                                                            <button
                                                                onClick={() => {
                                                                    const session = sessions.find(s => s.student._id === student._id && s.status === 'Scheduled');
                                                                    if (session) handleCancelSession(session._id);
                                                                }}
                                                                className="text-red-600 hover:text-red-900 font-bold flex items-center gap-1"
                                                                title="Cancel and remove this session"
                                                            >
                                                                <XCircle size={16} /> Cancel Session
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/application/${student._id}`)}
                                                        className="text-blue-600 hover:text-blue-900 font-bold"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                        <div className="p-4 border-t border-slate-100 text-center">
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">View All Students</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

const ArrowRight = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

export default CounselorDashboard;
