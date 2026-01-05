import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Save, User } from 'lucide-react';
import { useToast } from '../context/ToastContext';

import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        // Student fields
        gpa: '',
        sat: '',
        toefl: '',
        ielts: '',
        maxTuition: '',
        desiredMajor: '',
        preferredDestinations: '',
        careerGoals: '',
        campusPreferences: [],
        // Counselor fields
        specialization: '',
        experienceYears: '',
        bio: '',
        skills: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                // Student
                gpa: user.academicHistory?.gpa || '',
                sat: user.testScores?.sat || '',
                toefl: user.testScores?.toefl || '',
                ielts: user.testScores?.ielts || '',
                maxTuition: user.budget?.maxTuition || '',
                desiredMajor: user.interests?.desiredMajor?.join(', ') || '',
                preferredDestinations: user.interests?.preferredStudyDestinations?.join(', ') || '',
                careerGoals: user.interests?.careerGoals || '',
                campusPreferences: user.interests?.campusPreferences || [],
                // Counselor
                specialization: user.counselorProfile?.specialization || '',
                experienceYears: user.counselorProfile?.experienceYears || '',
                bio: user.counselorProfile?.bio || '',
                skills: user.counselorProfile?.skills?.join(', ') || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'campusPreferences') {
            const currentPrefs = formData.campusPreferences;
            if (checked) {
                setFormData({ ...formData, campusPreferences: [...currentPrefs, value] });
            } else {
                setFormData({ ...formData, campusPreferences: currentPrefs.filter(p => p !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatePayload = {
            profile: {
                firstName: formData.firstName,
                lastName: formData.lastName
            }
        };

        if (user.role === 'consultant') {
            updatePayload.counselorProfile = {
                specialization: formData.specialization,
                experienceYears: parseInt(formData.experienceYears) || 0,
                bio: formData.bio,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            };
        } else {
            updatePayload.academicHistory = {
                gpa: parseFloat(formData.gpa) || undefined
            };
            updatePayload.testScores = {
                sat: parseInt(formData.sat) || undefined,
                toefl: parseInt(formData.toefl) || undefined,
                ielts: parseFloat(formData.ielts) || undefined
            };
            updatePayload.budget = {
                maxTuition: parseInt(formData.maxTuition) || undefined
            };
            updatePayload.interests = {
                desiredMajor: formData.desiredMajor.split(',').map(s => s.trim()).filter(Boolean),
                preferredStudyDestinations: formData.preferredDestinations.split(',').map(s => s.trim()).filter(Boolean),
                careerGoals: formData.careerGoals,
                campusPreferences: formData.campusPreferences
            };
        }

        try {
            const response = await authAPI.updateProfile(updatePayload);
            updateUser(response.data);
            addToast('Profile updated successfully!', 'success');

            setTimeout(() => {
                navigate(user.role === 'consultant' ? '/counselor/dashboard' : '/dashboard');
            }, 1000);

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile.';
            addToast(errorMessage, 'error');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">

            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <User className="text-blue-600" /> My Profile
            </h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                {/* Personal Info */}
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Personal Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>
                </div>

                {user.role === 'consultant' ? (
                    /* Counselor Specific Fields */
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Professional Details</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. Ivy League Admissions, STEM"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                                <input
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. 5"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Core Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g. Essay Review, Visa Guidance, Career Coaching"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Professional Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="input-field h-32"
                                placeholder="Tell students about your background and how you can help them..."
                            />
                        </div>
                    </div>
                ) : (
                    /* Student Specific Fields */
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Academic Info */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Academic & Test Scores</h2>
                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">GPA (0-4.0)</label>
                                    <input type="number" step="0.1" name="gpa" value={formData.gpa} onChange={handleChange} className="input-field" placeholder="e.g. 3.8" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">SAT Score</label>
                                    <input type="number" name="sat" value={formData.sat} onChange={handleChange} className="input-field" placeholder="e.g. 1400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">TOEFL</label>
                                    <input type="number" name="toefl" value={formData.toefl} onChange={handleChange} className="input-field" placeholder="e.g. 100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">IELTS</label>
                                    <input type="number" step="0.5" name="ielts" value={formData.ielts} onChange={handleChange} className="input-field" placeholder="e.g. 7.5" />
                                </div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Preferences & Budget</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Annual Tuition (USD)</label>
                                    <input type="number" name="maxTuition" value={formData.maxTuition} onChange={handleChange} className="input-field" placeholder="e.g. 50000" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Desired Majors (comma separated)</label>
                                        <input type="text" name="desiredMajor" value={formData.desiredMajor} onChange={handleChange} className="input-field" placeholder="e.g. Computer Science, Engineering" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Destinations (comma separated)</label>
                                        <input type="text" name="preferredDestinations" value={formData.preferredDestinations} onChange={handleChange} className="input-field" placeholder="e.g. USA, UK, Canada" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Career Goals</label>
                                    <textarea
                                        name="careerGoals"
                                        value={formData.careerGoals}
                                        onChange={handleChange}
                                        className="input-field h-24"
                                        placeholder="Describe your career aspirations..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Campus Preferences</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {['Urban', 'Suburban', 'Rural', 'Large', 'Medium', 'Small'].map(pref => (
                                            <label key={pref} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="campusPreferences"
                                                    value={pref}
                                                    checked={formData.campusPreferences.includes(pref)}
                                                    onChange={handleChange}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                {pref}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default Profile;
