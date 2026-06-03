import React, { useState } from 'react';
import { BookOpen, User, GraduationCap, MapPin, Upload, CheckCircle, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';

const AdmissionPortal = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Admission Data Submitted:", data);
    setIsSubmitted(true);
    // In real app, dispatch to redux or axios post here
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-xl text-center border border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Thank you for applying to the State Institute of Technology. Your application reference number is <span className="font-mono font-bold text-brand-600 dark:text-brand-400">APP-2024-9082</span>. We will notify you via email once your documents are verified.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 py-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-white font-extrabold text-3xl shadow-lg shadow-brand-500/30 mb-4">
          Ω
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Online Admission Portal
        </h1>
        <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
          Start your journey with us. Fill out the application form below.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-dark-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Progress Tracker */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-800/50">
          <div className={`flex-1 py-4 text-center font-medium text-sm border-b-2 ${step >= 1 ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400'}`}>
            <span className="hidden sm:inline">1. Personal Info</span>
            <span className="sm:hidden">1</span>
          </div>
          <div className={`flex-1 py-4 text-center font-medium text-sm border-b-2 ${step >= 2 ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400'}`}>
            <span className="hidden sm:inline">2. Academic Preference</span>
            <span className="sm:hidden">2</span>
          </div>
          <div className={`flex-1 py-4 text-center font-medium text-sm border-b-2 ${step >= 3 ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-400'}`}>
            <span className="hidden sm:inline">3. Documents</span>
            <span className="sm:hidden">3</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10">
          
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-brand-500 w-5 h-5" /> Personal Details
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input {...register("firstName", { required: true })} type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input {...register("lastName", { required: true })} type="text" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input {...register("email", { required: true })} type="email" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input {...register("phone", { required: true })} type="tel" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input {...register("dob", { required: true })} type="date" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select {...register("gender")} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="text-brand-500 w-5 h-5" /> Academic Preferences
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Department</label>
                  <select {...register("department")} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
                    <option value="">Select a department...</option>
                    <option value="CS">Computer Science</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="BA">Business Administration</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Course</label>
                  <select {...register("course")} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none">
                    <option value="">Select a course...</option>
                    <option value="BTECH-CE">B.Tech Computer Engineering</option>
                    <option value="BTECH-ME">B.Tech Mechanical</option>
                    <option value="MBA">Master of Business Administration</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="text-brand-500 w-5 h-5" /> Document Uploads
              </h3>
              <p className="text-sm text-slate-500">Please upload clear copies of the following documents. Max size 5MB per file.</p>
              
              <div className="space-y-4">
                
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Passport Size Photo</p>
                      <p className="text-xs text-slate-500">JPG, PNG</p>
                    </div>
                  </div>
                  <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md shadow-sm">Upload</button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Government ID Proof</p>
                      <p className="text-xs text-slate-500">PDF, JPG</p>
                    </div>
                  </div>
                  <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md shadow-sm">Upload</button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Previous Marksheets (12th / Degree)</p>
                      <p className="text-xs text-slate-500">PDF combined</p>
                    </div>
                  </div>
                  <button type="button" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md shadow-sm">Upload</button>
                </div>

              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition"
              >
                Back
              </button>
            ) : <div></div>}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 transition shadow-md"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-2.5 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition shadow-lg shadow-brand-500/30"
              >
                Submit Application
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdmissionPortal;
