import React, { useState, useEffect } from "react";
import { URLS, ImageUrl } from "../../Urls";
import '../../assets/css/onboarding.css';
import { User, Mail, Phone, MapPin, Globe, Lock, Camera, Save } from "lucide-react";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    setLoading(true);
    const userInfo = localStorage.getItem("userInfo");
    let userId = "";
    
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        console.log("Parsed userInfo from localStorage:", parsed);
        userId = parsed.id || parsed._id;
      } catch (e) {
        console.error("Error parsing user info", e);
      }
    }

    if (!userId) {
        console.error("No user ID found in localStorage");
        setLoading(false);
        return;
    }

    const token = localStorage.getItem("authToken") || "";
    console.log(`Fetching user data for ID: ${userId}`);

    fetch(`${URLS.USERS}/${userId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        console.log("User API Response:", result);
        if (result) {
          const data = result.data || result.user || result; // Handle potential wrapper
          setUserData(data);
          
          setFormData({
            firstName: data.userName || data.name || "",
            lastName: "", 
            email: data.email || "",
            mobile: data.mobile || "",
            address: data.address || "",
            country: data.country || "",
            state: data.state || "",
            city: data.city || "",
            postalCode: data.postalCode || "",
          });
          
          if (data.profilePic) {
             setPreviewImage(`${ImageUrl}${data.profilePic}`);
          }
        }
      })
      .catch((err) => console.error("Error fetching user data:", err))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header mb-8">
          <div className="row">
            <div className="col">
              <h3 className="page-title text-2xl font-bold text-[#031E40]">Profile</h3>
              <ul className="breadcrumb text-sm text-gray-500">
                <li className="breadcrumb-item">
                  <a href="/index">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Settings / Profile</li>
              </ul>
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00467F]"></div>
            </div>
        ) : (
            <div className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-[#031E40] mb-6 pb-2 border-b border-gray-100">Basic Information</h4>
                    
                    {/* Profile Photo Upload */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                             {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <User size={40} className="text-gray-300" />
                             )}
                        </div>
                        <div>
                            <p className="font-semibold text-[#031E40] mb-1">Profile Photo</p>
                            <p className="text-xs text-gray-500 mb-3">Recommended image size is 40px x 40px</p>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-[#00467F] text-white text-sm font-medium rounded-lg hover:bg-[#031E40] transition-colors flex items-center gap-2">
                                    <Camera size={16} /> Upload
                                </button>
                                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                            <input 
                                type="text" 
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                            <input 
                                type="text" 
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                            <input 
                                type="text" 
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-[#031E40] mb-6 pb-2 border-b border-gray-100">Address Information</h4>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                        <input 
                            type="text" 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                            <select 
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            >
                                <option value="">Select Country</option>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                            <select 
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            >
                                <option value="">Select State</option>
                                <option value="Telangana">Telangana</option>
                                <option value="California">California</option>
                                <option value="London">London</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                            <input 
                                type="text" 
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                            <input 
                                type="text" 
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-[#031E40] mb-6 pb-2 border-b border-gray-100">Change Password</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all pr-10"
                                />
                                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all pr-10"
                                />
                                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all pr-10"
                                />
                                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-8">
                     <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button className="px-6 py-2.5 bg-[#00467F] text-white text-sm font-semibold rounded-lg hover:bg-[#031E40] transition-colors shadow-lg shadow-blue-900/10 flex items-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
