import { useState } from 'react';
import { LogOut, Mail, Phone, MapPin,  Edit2,Star } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import engineerimg from "/src/assets/images/engineering.png";
import service from "/src/assets/images/service.png";

const EngineerProfile = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(engineerimg); // الصورة الحالية



    const [isEditing, setIsEditing] = useState({
        contact: false,
        SpecializationDetails: false,
    });

    const [engineer, setEngineer] = useState({
        name: "Eng.Mohamed",
        location: "Monufia, Eg",
        contact: {
            email: "Mohamed@email.com",
            phone: "(555) 123-4567",
            address: "Monufia, Egypt",
        },
        SpecializationDetails: {
            Specialization: "Bachelor of Agriculture Engineering",
            ServicesTypes:"Agricultural Consultation",
        },
       
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
    
    const handleImageChange = (event) => {
        const file = event.target.files[0]; // الحصول على الملف المختار
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result); // تحديث الصورة
            };
            reader.readAsDataURL(file);
        }
    };

    const renderContactInfo = () => (
        <div className="space-y-3">
            {isEditing.contact ? (
                <>
                    {renderEditableField("email", engineer.contact.email, (value) =>
                        setEngineer({ ...engineer, contact: { ...engineer.contact, email: value } })
                    )}
                    {renderEditableField("phone", engineer.contact.phone, (value) =>
                        setEngineer({ ...engineer, contact: { ...engineer.contact, phone: value } })
                    )}
                    {renderEditableField("address", engineer.contact.address, (value) =>
                        setEngineer({ ...engineer, contact: { ...engineer.contact, address: value } })
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
                        <span>{engineer.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span>{engineer.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span>{engineer.contact.address}</span>
                    </div>
                </>
            )}
        </div>
    );

    const renderspecializationDetails = () => (
        <div className="space-y-3">
            {isEditing.SpecializationDetails ? (
                <>
                    {renderEditableField("Specialization", engineer.SpecializationDetails.Specialization, (value) =>
                        setEngineer({ ...engineer, SpecializationDetails: { ...engineer.SpecializationDetails, Specialization: value } })
                    )}
                    {renderEditableField("ServicesTypes", engineer.SpecializationDetails.ServicesTypes, (value) =>
                        setEngineer({ ...engineer, SpecializationDetails: { ...engineer.SpecializationDetails, ServicesTypes: value } })
                    )}
                    <button
                        onClick={() => handleSave('SpecializationDetails')}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Save
                    </button>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-green-600" />
                        <span>Specialization: {engineer.SpecializationDetails.Specialization}</span>
                    </div>
                   
                    <div className="flex items-center gap-3">
                    <img 
        src={service} 
        alt="Icon" 
        className="w-6 h-6" // تصغير الصورة إلى حجم صغير
    />
                        <span>Services Types: {engineer.SpecializationDetails.ServicesTypes}</span>
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
        src={profileImage} // استخدام الصورة من الحالة
        alt="Engineer profile"
        className="rounded-full mx-auto w-32 h-32 object-cover border-4 border-white shadow-lg"
    />
    <label
        htmlFor="imageUpload"
        className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 p-2 bg-green-600 rounded-full text-white hover:bg-green-700 cursor-pointer"
    >
        <Edit2 className="w-4 h-4" />
    </label>
    <input
        id="imageUpload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange} // وظيفة تغيير الصورة
    />
</div>

                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
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

                    {/* specialization Details */}
                    <div className="bg-white p-6 rounded-lg shadow relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Specialization Details</h2>
                            <button
                                onClick={() => setIsEditing({ ...isEditing, SpecializationDetails: !isEditing.SpecializationDetails })}
                                className="text-green-600 hover:text-green-700"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        {renderspecializationDetails()}
                    </div>
                </div>

               
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={()=> navigate("/register/company")}>
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
       
      
   
    
    );
};

export default EngineerProfile;