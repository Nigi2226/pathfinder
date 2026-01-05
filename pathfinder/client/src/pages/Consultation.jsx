import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Consultation = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [formData, setFormData] = useState({
        expertName: 'Dr. Sarah Smith',
        expertRole: 'Senior Counselor',
        date: '',
        topic: 'General Guidance'
    });

    const [experts, setExperts] = useState([]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cvv: '',
        expiry: '',
        mobileNumber: '',
        transactionId: ''
    });

    useEffect(() => {
        fetchSessions();
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            const res = await api.get('/experts');
            setExperts(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    expertId: res.data[0]._id,
                    expertName: res.data[0].name,
                    expertRole: res.data[0].role
                }));
            }
        } catch (error) {
            console.error('Error fetching experts');
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await api.get('/consultations');
            setSessions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            setLoading(false);
        }
    };

    const handleBook = (e) => {
        e.preventDefault();
        if (!formData.expertName || !formData.date || !formData.topic) {
            alert('Please fill in all booking details.');
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        // Mock validation
        if (paymentMethod === 'Card' && (!paymentDetails.cardNumber || !paymentDetails.cvv)) {
            alert('Please enter card details');
            return;
        }
        if ((paymentMethod === 'bKash' || paymentMethod === 'Nogod') && !paymentDetails.mobileNumber) {
            alert('Please enter mobile number');
            return;
        }

        try {
            setBooking(true);
            await api.post('/consultations', {
                expertId: formData.expertId,
                expertName: formData.expertName,
                expertRole: formData.expertRole,
                date: formData.date,
                topic: formData.topic,
                paymentMethod,
                transactionId: paymentDetails.transactionId || `TXN-${Date.now()}`,
                amount: 500 // Fixed amount for now
            });
            alert('Session booked successfully! Payment Received.');
            setFormData(prev => ({ ...prev, date: '', topic: 'General Guidance' }));
            setShowPaymentModal(false);
            fetchSessions();
        } catch (error) {
            console.error(error);
            alert('Booking failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="container mx-auto p-6 relative">
            <h1 className="text-3xl font-bold mb-6">Consultation Services</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Booking Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Book a Session</h2>
                    <form onSubmit={handleBook} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Expert</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={formData.expertName}
                                onChange={(e) => {
                                    const selected = experts.find(ex => ex.name === e.target.value);
                                    setFormData({
                                        ...formData,
                                        expertName: e.target.value,
                                        expertRole: selected ? selected.role : '',
                                        expertId: selected ? selected._id : ''
                                    });
                                }}
                            >
                                {experts.length > 0 ? experts.map(expert => (
                                    <option key={expert._id} value={expert.name}>
                                        {expert.name} ({expert.role})
                                    </option>
                                )) : <option>Loading experts...</option>}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full border p-2 rounded"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Topic</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={booking}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${booking ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                                }`}
                        >
                            {booking ? 'Processing...' : 'Proceed to Pay & Book'}
                        </button>
                    </form>
                </div>

                {/* My Sessions Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">My Scheduled Sessions</h2>
                    {loading ? <p>Loading...</p> : (
                        <div className="space-y-4">
                            {sessions.length === 0 ? (
                                <p className="text-gray-500">No sessions scheduled.</p>
                            ) : (
                                sessions.map(session => (
                                    <div key={session._id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                                        <p className="font-bold">{session.expertName}</p>
                                        <p className="text-sm text-gray-600">{new Date(session.date).toLocaleString()}</p>
                                        <p className="text-sm">{session.topic}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`text-xs px-2 py-1 rounded ${session.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {session.status}
                                            </span>
                                            {session.status === 'Scheduled' && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to cancel?')) {
                                                            try {
                                                                await api.put(`/consultations/${session._id}/cancel`);
                                                                alert('Session cancelled.');
                                                                fetchSessions();
                                                            } catch (err) {
                                                                alert('Failed to cancel');
                                                            }
                                                        }
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-800 font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Amount to Pay:</p>
                            <p className="text-2xl font-bold text-blue-600">BDT 500</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Select Payment Method</label>
                            <div className="flex gap-2">
                                {['Card', 'bKash', 'Nogod'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`px-3 py-1 border rounded text-sm ${paymentMethod === method ? 'bg-blue-100 border-blue-500 text-blue-700' : 'text-gray-600'}`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit}>
                            {paymentMethod === 'Card' ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Card Number"
                                        className="w-full border p-2 rounded text-sm"
                                        value={paymentDetails.cardNumber}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full border p-2 rounded text-sm"
                                            value={paymentDetails.expiry}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="CVV"
                                            className="w-full border p-2 rounded text-sm"
                                            value={paymentDetails.cvv}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="tel"
                                        placeholder={`${paymentMethod} Mobile Number`}
                                        className="w-full border p-2 rounded text-sm"
                                        value={paymentDetails.mobileNumber}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileNumber: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="PIN (Mock)"
                                        className="w-full border p-2 rounded text-sm"
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Pay & Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultation;
