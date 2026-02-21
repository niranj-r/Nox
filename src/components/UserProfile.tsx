import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Edit2, Save, X } from 'lucide-react';


export default function UserProfile() {
    const { user, profile, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        shipping_address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        }
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                shipping_address: {
                    street: profile.shipping_address?.street || '',
                    city: profile.shipping_address?.city || '',
                    state: profile.shipping_address?.state || '',
                    zip: profile.shipping_address?.zip || '',
                    country: profile.shipping_address?.country || ''
                }
            });
        }
    }, [profile]);

    const handleSave = async () => {
        const { error } = await updateProfile({
            name: formData.name,
            phone: formData.phone,
            shipping_address: formData.shipping_address
        });

        if (!error) {
            setIsEditing(false);
        } else {
            alert('Failed to update profile: ' + error.message);
        }
    };

    if (!user || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p>Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-primary dark:text-white mb-8">
                My Profile
            </h1>

            <div className="max-w-3xl mx-auto">
                {/* Sidebar / Info Card */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#424242] rounded-lg shadow-md p-6 relative">
                        {/* Edit Toggle */}
                        <button
                            onClick={() => {
                                if (isEditing) handleSave();
                                else setIsEditing(true);
                            }}
                            className={`absolute top-4 right-4 p-2 rounded-full transition-smooth
                                ${isEditing
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-gray-100 dark:bg-[#363636] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#282828]'}`}
                            title={isEditing ? "Save Changes" : "Edit Profile"}
                        >
                            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>

                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="absolute top-4 right-16 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-smooth"
                                title="Cancel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        <div className="flex items-center space-x-4 mb-6 pt-4">
                            <div className="w-16 h-16 bg-primary dark:bg-white rounded-full flex items-center justify-center text-white dark:text-[#363636] text-2xl font-bold">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-1 border rounded text-lg font-bold text-gray-900 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                ) : (
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h2>
                                )}
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 text-gray-600 dark:text-gray-400">
                                <User className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div className="w-full">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Contact</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full p-1 border rounded text-sm border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    ) : (
                                        <p>{profile.phone}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-gray-600 dark:text-gray-400">
                                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                                <div className="w-full">
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Shipping Address</p>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Street"
                                                value={formData.shipping_address.street}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    shipping_address: { ...formData.shipping_address, street: e.target.value }
                                                })}
                                                className="w-full p-1 border rounded text-sm border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    value={formData.shipping_address.city}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        shipping_address: { ...formData.shipping_address, city: e.target.value }
                                                    })}
                                                    className="w-full p-1 border rounded text-sm border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="State"
                                                    value={formData.shipping_address.state}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        shipping_address: { ...formData.shipping_address, state: e.target.value }
                                                    })}
                                                    className="w-full p-1 border rounded text-sm border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Zip"
                                                    value={formData.shipping_address.zip}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        shipping_address: { ...formData.shipping_address, zip: e.target.value }
                                                    })}
                                                    className="w-full p-1 border rounded text-sm border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Country"
                                                    value={formData.shipping_address.country}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        shipping_address: { ...formData.shipping_address, country: e.target.value }
                                                    })}
                                                    className="w-full p-1 border rounded text-sm border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p>{profile.shipping_address.street}</p>
                                            <p>{profile.shipping_address.city}, {profile.shipping_address.state}</p>
                                            <p>{profile.shipping_address.zip}</p>
                                            <p>{profile.shipping_address.country}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

