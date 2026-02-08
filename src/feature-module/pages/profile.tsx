import React, { useState, useEffect } from "react";
import { URLS, ImageUrl } from "../../Urls";
import '../../assets/css/onboarding.css';
import { User, Mail, Phone, Camera, Save, Eye, EyeOff } from "lucide-react";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobile: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setUserId(userId);

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
            userName: data.userName || data.name || "",
            email: data.email || "",
            mobile: data.mobile || "",
          });
          
          if (data.journalImage) {
             setPreviewImage(`${ImageUrl}${data.journalImage}`);
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

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken") || "";
      const formBody = new FormData();
      if (formData.userName) formBody.append("userName", formData.userName);
      if (formData.email) formBody.append("email", formData.email);
      if (formData.mobile) formBody.append("mobile", formData.mobile);
      if (passwords.newPassword || passwords.currentPassword || passwords.confirmPassword) {
        if (!passwords.newPassword || !passwords.confirmPassword) {
          alert("Enter new password and confirm password");
          throw new Error("Password change validation failed");
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          alert("New password and confirm password do not match");
          throw new Error("Password change validation failed");
        }
        if (!passwords.currentPassword) {
          alert("Enter current password to change password");
          throw new Error("Password change validation failed");
        }
        formBody.append("password", passwords.newPassword);
        if (passwords.currentPassword) {
          formBody.append("currentPassword", passwords.currentPassword);
        }
      }
      if (profileFile) formBody.append("journalImage", profileFile);
      const res = await fetch(`${URLS.USERS}/update/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formBody,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to update profile");
      }
      alert("Profile updated successfully");
    } catch (e: any) {
      alert(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
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
                <li className="breadcrumb-item active"> Profile</li>
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
                                <button type="button" onClick={() => document.getElementById('profile-pic-input')?.click()} className="px-4 py-2 bg-[#00467F] text-white text-sm font-medium rounded-lg hover:bg-[#031E40] transition-colors flex items-center gap-2">
                                    <Camera size={16} /> Upload
                                </button>
                                <button type="button" onClick={() => { setProfileFile(null); setPreviewImage(null); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                            <input id="profile-pic-input" type="file" className="hidden" accept="image/*" onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setProfileFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => setPreviewImage(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">User Name</label>
                            <input 
                                type="text" 
                                name="userName"
                                value={formData.userName}
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
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all"
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="text-lg font-bold text-[#031E40] mb-6 pb-2 border-b border-gray-100">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={onPasswordChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00467F] hover:text-[#003366] transition-colors"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            aria-label="toggle password visibility"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={onPasswordChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00467F] hover:text-[#003366] transition-colors"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label="toggle password visibility"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={onPasswordChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#00467F]/20 focus:border-[#00467F] outline-none transition-all pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00467F] hover:text-[#003366] transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="toggle password visibility"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 pb-8">
                     <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#00467F] text-white text-sm font-semibold rounded-lg hover:bg-[#031E40] transition-colors shadow-lg shadow-blue-900/10 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
