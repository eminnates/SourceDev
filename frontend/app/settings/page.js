'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/utils/api/authApi';
import { getUserById } from '@/utils/api/userApi';
import { getUser } from '@/utils/auth';

const getFallbackAvatar = (seed = 'User') =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=1ABC9C&color=fff&bold=true`;

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentImage, setCurrentImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [displayedUser, setDisplayedUser] = useState(null);

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        profileImageUrl: '',
        bio: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const currentUser = getUser();
            console.log(currentUser);
            if (!currentUser || !currentUser.id) {
                console.log('User session not found');
                setMessage({ type: 'error', text: 'User session not found' });
                setLoading(false);
                return;
            }

            const response = await getUserById(currentUser.id);
            if (response.success && response.data) {
                const userData = response.data;
                const nextImage = userData.profileImageUrl || '';
                setDisplayedUser(userData.displayName);
                setFormData({
                    profileImageUrl: nextImage,
                    bio: userData.bio || ''
                });
                setCurrentImage(nextImage);
                setPreviewImage('');
            } else {
                setMessage({ type: 'error', text: 'Failed to load user profile' });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'An error occurred while loading profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'profileImageUrl') {
            setPreviewImage(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        const payload = {
            displayName: displayedUser,
            bio: formData.bio,
            profileImageUrl: formData.profileImageUrl || null
        };

        try {
            const response = await updateProfile(payload);
            if (response.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setCurrentImage(formData.profileImageUrl);
                setPreviewImage('');
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'An error occurred while updating profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select a valid image file.' });
            return;
        }

        const form = new FormData();
        form.append('file', file);
        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/uploads/profile', {
                method: 'POST',
                body: form
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                profileImageUrl: data.url
            }));
            setPreviewImage(data.url);
            setMessage({ type: 'success', text: 'Image uploaded. Remember to save changes.' });
        } catch (error) {
            console.error('Image upload failed:', error);
            setMessage({ type: 'error', text: error.message || 'Unable to upload image.' });
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-brand-dark mb-8">Settings</h1>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-brand-dark mb-6">User Profile</h2>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-8">
                                {/* Image Preview */}
                                <div>
                                    <label className="block text-sm font-medium text-brand-dark mb-2">
                                        Profile Image
                                    </label>
                                    <div className="flex flex-wrap gap-6 items-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-28 h-28 rounded-full border-4 border-brand-primary/40 overflow-hidden shadow">
                                                <img
                                                    src={previewImage || currentImage || getFallbackAvatar('User')}
                                                    alt="Profile avatar preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-xs text-brand-muted">
                                                {previewImage ? 'Preview' : 'Current'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-3 flex-1 min-w-[220px]">
                                            <input
                                                type="url"
                                                id="profileImageUrl"
                                                name="profileImageUrl"
                                                value={formData.profileImageUrl}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                                                placeholder="https://example.com/avatar.png"
                                            />
                                            <p className="text-sm text-brand-muted">
                                                Enter the profile image URL.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-brand-dark mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary resize-none"
                                        placeholder="Tell us a little bit about yourself..."
                                    />
                                    <p className="mt-2 text-sm text-brand-muted">
                                        Brief description for your profile. URLs are hyperlinked.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-2.5 bg-brand-primary text-white font-medium rounded-md shadow-sm hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-brand-dark mb-6">Security</h2>
                        
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-brand-dark">Password</h3>
                                    <p className="text-sm text-brand-muted mt-1">
                                        Change your password to keep your account secure
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/change-password')}
                                    className="px-6 py-2.5 bg-brand-primary text-white font-medium rounded-md shadow-sm hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
