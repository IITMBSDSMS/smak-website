"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function CourseApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    photo: null,
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const uploadPhoto = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user_photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('user_photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const generateUserId = () => {
    // Generate a secure user ID mock
    return crypto.randomUUID();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Upload Photo to S3/Supabase
      let photoUrl = "";
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo);
      }

      // 2. Insert User into Users Mentee Table
      const { data: userData, error: userError } = await supabase
        .from('users_mentee')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          college_name: formData.college,
          year_of_study: formData.year,
          course_enrolled: courseId,
          photo_url: photoUrl
        }])
        .select()
        .single();
        
      if (userError) throw userError;

      // 3. Insert Enrollment Record (Pending Payment)
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([{
          user_id: userData.id,
          course_id: courseId, // Note: Course ID needs to exist in the database or this will fail FK constraint. For now, we assume it's a valid UUID.
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // 4. Trigger Payment Order via API
      const payRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId: userData.id,
          amount: 5000 // Dummy fee
        })
      });
      const orderData = await payRes.json();

      if (orderData.success) {
        // Here you would trigger Razorpay/Stripe checkout form using orderData.order
        // For simulation, we skip direct payment UI and go to waiting state
        setStep(2); // Success / Payment waiting step
      } else {
        throw new Error(orderData.error);
      }

    } catch (err) {
      console.error(err);
      alert("Error submitting application: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#ff4e4e] selection:text-white flex flex-col pt-32 pb-20 items-center justify-center font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff4e4e]/10 via-black to-black -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl px-6"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Glassmorphic Highlights */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff4e4e] to-transparent opacity-50" />
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-10 text-center">
                  <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                    Course Application
                  </h1>
                  <p className="text-gray-400 text-sm tracking-widest uppercase">
                    Secure your spot today
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Full Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e4e] focus:ring-1 focus:ring-[#ff4e4e] transition-all text-white"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Email Address</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e4e] focus:ring-1 focus:ring-[#ff4e4e] transition-all text-white"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Phone</label>
                      <input 
                        required
                        type="tel" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e4e] focus:ring-1 focus:ring-[#ff4e4e] transition-all text-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">College / University</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e4e] focus:ring-1 focus:ring-[#ff4e4e] transition-all text-white"
                        value={formData.college}
                        onChange={(e) => setFormData({...formData, college: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Year of Study</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff4e4e] focus:ring-1 focus:ring-[#ff4e4e] transition-all text-white"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Profile Photo</label>
                    <div className="relative group">
                      <input 
                        required
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-8 text-center group-hover:border-[#ff4e4e] transition-colors">
                        {formData.photo ? (
                          <span className="text-[#ff4e4e] font-medium">{formData.photo.name}</span>
                        ) : (
                          <span className="text-gray-400">Click to upload photo (Used for ID/Certificate)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full relative overflow-hidden bg-white text-black font-semibold rounded-xl px-6 py-4 mt-8 hover:scale-[1.02] transform transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="relative z-10">{loading ? "Processing..." : "Proceed to Payment"}</span>
                    <div className="absolute inset-0 bg-[#ff4e4e] opacity-0 group-hover:opacity-10 transition-opacity" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Your details have been saved. We are redirecting you to our secure payment gateway to complete your enrollment...
                </p>
                <p className="text-xs text-gray-500">
                  Mock Implementation: In a real environment, the Razorpay/Stripe checkout modal would open here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
