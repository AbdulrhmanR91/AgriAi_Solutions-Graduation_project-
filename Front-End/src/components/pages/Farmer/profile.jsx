import { useState } from 'react';
import { LogOut, Mail, Phone, MapPin, Droplet, Edit2, Sprout } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import harvester from "/src/assets/images/harvester.png";

const FarmerProfile = () => {
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState({
        contact: false,
        farmDetails: false,
    });

    const [farmer, setFarmer] = useState({
        name: "Abdulrhman",
        location: "Monufia, Eg",
        contact: {
            email: "abdo@email.com",
            phone: "(555) 123-4567",
            address: "Monufia, Egypt",
        },
        farmDetails: {
            totalArea: "500 acres",
            irrigatedArea: "400 acres",
            primaryCrops: ["Corn", "Soybeans", "Wheat"],
        },
        recentActivity: [
            { date: "2024-12-15", activity: "Crop rotation completed" },
            { date: "2024-12-10", activity: "Irrigation system maintenance" },
            { date: "2024-12-05", activity: "Soil testing performed" },
        ],
    });

    const handleSave = (section) => {
        setIsEditing({ ...isEditing, [section]: false });
        // Here you would typically save the changes to your backend
    };

    const renderEditableField = (field, value, onChange) => (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border rounded"
        />
    );

    const renderContactInfo = () => (
        <div className="space-y-3">
            {isEditing.contact ? (
                <>
                    {renderEditableField("email", farmer.contact.email, (value) =>
                        setFarmer({ ...farmer, contact: { ...farmer.contact, email: value } })
                    )}
                    {renderEditableField("phone", farmer.contact.phone, (value) =>
                        setFarmer({ ...farmer, contact: { ...farmer.contact, phone: value } })
                    )}
                    {renderEditableField("address", farmer.contact.address, (value) =>
                        setFarmer({ ...farmer, contact: { ...farmer.contact, address: value } })
                    )}
                    <button
                        onClick={() => handleSave('contact')}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Save
                    </button>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-green-600" />
                        <span>{farmer.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span>{farmer.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span>{farmer.contact.address}</span>
                    </div>
                </>
            )}
        </div>
    );

    const renderFarmDetails = () => (
        <div className="space-y-3">
            {isEditing.farmDetails ? (
                <>
                    {renderEditableField("totalArea", farmer.farmDetails.totalArea, (value) =>
                        setFarmer({ ...farmer, farmDetails: { ...farmer.farmDetails, totalArea: value } })
                    )}
                    {renderEditableField("irrigatedArea", farmer.farmDetails.irrigatedArea, (value) =>
                        setFarmer({ ...farmer, farmDetails: { ...farmer.farmDetails, irrigatedArea: value } })
                    )}
                    {renderEditableField("primaryCrops", farmer.farmDetails.primaryCrops.join(", "), (value) =>
                        setFarmer({ ...farmer, farmDetails: { ...farmer.farmDetails, primaryCrops: value.split(", ") } })
                    )}
                    <button
                        onClick={() => handleSave('farmDetails')}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Save
                    </button>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span>Total Area: {farmer.farmDetails.totalArea}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Droplet className="w-5 h-5 text-green-600" />
                        <span>Irrigated Area: {farmer.farmDetails.irrigatedArea}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Sprout className="w-5 h-5 text-green-600" />
                        <span>Primary Crops: {farmer.farmDetails.primaryCrops.join(", ")}</span>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="p-8 pb-24">
                <div className="max-w-3xl mx-auto ">
                    {/* Profile Header */}
                    <div className="text-center mb-8">
                        <div className="relative">
                            <img
                                src={harvester}
                                alt="Farmer profile"
                                className="rounded-full mx-auto w-32 h-32 object-cover border-4 border-white shadow-lg"
                            />
                            <button className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 p-2 bg-green-600 rounded-full text-white hover:bg-green-700">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4 relative inline-block">
                            <h1 className="text-2xl font-bold text-gray-900">{farmer.name}</h1>
                            <p className="text-gray-600 flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {farmer.location}
                            </p>
                            <button className="absolute -right-6 top-0 p-2 text-green-600 hover:text-green-700">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Contact Information */}
                        <div className="bg-white p-6 rounded-lg shadow relative">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Contact Information</h2>
                                <button
                                    onClick={() => setIsEditing({ ...isEditing, contact: !isEditing.contact })}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            {renderContactInfo()}
                        </div>

                        {/* Farm Details */}
                        <div className="bg-white p-6 rounded-lg shadow relative">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Farm Details</h2>
                                <button
                                    onClick={() => setIsEditing({ ...isEditing, farmDetails: !isEditing.farmDetails })}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            {renderFarmDetails()}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {farmer.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                                    <div>
                                        <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                                        <p className="text-gray-700">{activity.activity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            onClick={() => navigate("/register/company")}>
                            Register as Company
                        </button>

                        <button
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            onClick={() => navigate("/")}
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerProfile;
