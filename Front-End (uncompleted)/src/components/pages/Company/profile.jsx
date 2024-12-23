import { useState } from 'react';
import { Edit2, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import BottomNavigation from './BottomNavCompany';


const CompanyProfile = () => {
    const [isEditing, setIsEditing] = useState({
        contact: false,
        companyDetails: false,
    });
    const [activeTab, setActiveTab] = useState('home');

    const [company, setCompany] = useState({
        name: "Delta Agricultural Co.",
        location: "Monufia, Egypt",
        contact: {
            email: "Delta Agricultural Co.@gmail.com",
            phone: "+2010299",
            address: "Monufia, Egypt"
        },
        companyDetails: {
            location: "Monufia, Egypt",
            companyType: "Supplier"
        }
    });
  
    const renderContactInfo = () => (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <button
                    onClick={() => setIsEditing({ ...isEditing, contact: !isEditing.contact })}
                    className="text-green-600 hover:text-green-700"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
            {isEditing.contact ? (
                <div className="space-y-3">
                    <input
                        type="email"
                        value={company.contact.email}
                        onChange={(e) => setCompany({
                            ...company,
                            contact: { ...company.contact, email: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="tel"
                        value={company.contact.phone}
                        onChange={(e) => setCompany({
                            ...company,
                            contact: { ...company.contact, phone: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        value={company.contact.address}
                        onChange={(e) => setCompany({
                            ...company,
                            contact: { ...company.contact, address: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                    />
                    <button
                        onClick={() => setIsEditing({ ...isEditing, contact: false })}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span>{company.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <span>{company.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <span>{company.contact.address}</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderCompanyDetails = () => (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Company Details</h2>
                <button
                    onClick={() => setIsEditing({ ...isEditing, companyDetails: !isEditing.companyDetails })}
                    className="text-green-600 hover:text-green-700"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
            {isEditing.companyDetails ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={company.companyDetails.location}
                        onChange={(e) => setCompany({
                            ...company,
                            companyDetails: { ...company.companyDetails, location: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        value={company.companyDetails.companyType}
                        onChange={(e) => setCompany({
                            ...company,
                            companyDetails: { ...company.companyDetails, companyType: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                    />
                    <button
                        onClick={() => setIsEditing({ ...isEditing, companyDetails: false })}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <span>{company.companyDetails.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5">🏢</div>
                        <span>Company Type</span>
                        <span className="text-green-500">{company.companyDetails.companyType}</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-8 pb-24">
                <div className="max-w-3xl mx-auto">
                    {/* Profile Header */}
                    <div className="text-center mb-8">
                        <div className="relative">
                            <img
                                src="/api/placeholder/128/128"
                                alt="Company profile"
                                className="rounded-full mx-auto w-32 h-32 object-cover border-4 border-white shadow-lg"
                            />
                            <button className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 p-2 bg-green-600 rounded-full text-white hover:bg-green-700">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4 relative inline-block">
                            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                            <p className="text-gray-600 flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {company.location}
                            </p>
                            <button className="absolute -right-6 top-0 p-2 text-green-600 hover:text-green-700">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {renderContactInfo()}
                        {renderCompanyDetails()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center mt-8">
                        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Register as Individual
                        </button>
                        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
                  <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            
        </div>
    );
};

export default CompanyProfile;