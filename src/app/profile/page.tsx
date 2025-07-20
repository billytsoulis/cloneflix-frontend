// frontend/src/app/profile/page.tsx

"use client"; // This is a client component

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { fetchUserProfile, updateUserProfile, UserProfile, logoutUser } from '@/lib/api'; // Import logoutUser

// Combined schema for updating email and password
const profileUpdateSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  currentPassword: z.string().optional(), // Optional, but required if newPassword is provided
  newPassword: z.string().optional(),     // Optional
  confirmNewPassword: z.string().optional(), // Optional, but required if newPassword is provided
}).refine((data) => {
  // If newPassword is provided, then currentPassword and confirmNewPassword must also be provided
  if (data.newPassword && data.newPassword.length > 0) {
    return data.currentPassword && data.currentPassword.length > 0 &&
           data.confirmNewPassword && data.confirmNewPassword.length > 0;
  }
  return true;
}, {
  message: "Current password and confirm new password are required to change password.",
  path: ["currentPassword"], // Error path can point to current password field
}).refine((data) => {
  // If newPassword is provided, it must be at least 6 characters
  if (data.newPassword && data.newPassword.length > 0) {
    return data.newPassword.length >= 6;
  }
  return true;
}, {
  message: "New password must be at least 6 characters long.",
  path: ["newPassword"],
}).refine((data) => {
  // If newPassword and confirmNewPassword are provided, they must match
  if (data.newPassword && data.confirmNewPassword) {
    return data.newPassword === data.confirmNewPassword;
  }
  return true;
}, {
  message: "Passwords do not match.",
  path: ["confirmNewPassword"],
});

type ProfileUpdateFormInputs = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission state

  // Form hook for combined update
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProfileUpdateFormInputs>({
    resolver: zodResolver(profileUpdateSchema),
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoadingProfile(true);
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        // Set current email in the form
        setValue('email', profile.email);
        setErrorProfile(null);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setErrorProfile(error.response?.data || "Failed to load profile.");
        toast.error("Failed to load profile. Please log in again.");
        router.push('/login'); // Redirect to login if profile fetch fails (e.g., token expired)
      } finally {
        setLoadingProfile(false);
      }
    };
    getProfile();
  }, [router, setValue]);

  const onUpdateProfile = async (data: ProfileUpdateFormInputs) => {
    setIsSubmitting(true);
    try {
      // Prepare payload: only send fields that have values
      const payload: { email?: string; currentPassword?: string; newPassword?: string } = {};

      // Flag to track if any sensitive data (email or password) was changed
      let sensitiveDataChanged = false;

      // Only send email if it's different from the current profile email
      if (userProfile && data.email !== userProfile.email) {
        payload.email = data.email;
        sensitiveDataChanged = true;
      }

      // Only send password fields if newPassword is provided
      if (data.newPassword && data.newPassword.length > 0) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
        sensitiveDataChanged = true;
      }

      // Only make API call if there are changes to send
      if (Object.keys(payload).length === 0) {
        toast("No changes detected.", { icon: 'ℹ️' });
        return;
      }

      await updateUserProfile(payload);
      toast.success("Profile updated successfully!");

      // If any sensitive data (email or password) was changed, force logout.
      // This is the most secure way to handle a token invalidation scenario.
      if (sensitiveDataChanged) {
        try {
          await logoutUser(); // Explicitly call logout API to clear HttpOnly cookie
          toast.success("Profile updated! Please log in with your new credentials.");
        } catch (logoutError) {
          console.error("Error during forced logout after profile change:", logoutError);
          // Log the error but don't block redirection.
          // The old token is invalid anyway, so redirecting is still the correct action.
          toast.error("Logout failed, but profile updated. Please log in again.");
        }
        router.push('/login'); // Always redirect to login page after sensitive profile change
      } else {
        // If no sensitive data was changed (e.g., if we later add a 'name' field),
        // then just refetch the profile to update the UI and reset the form.
        const updatedProfile = await fetchUserProfile();
        setUserProfile(updatedProfile);
        reset({ email: updatedProfile.email, currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }

    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data || "Failed to update profile.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
        <p className="ml-4 text-xl">Loading profile...</p>
      </div>
    );
  }

  if (errorProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
        <p className="text-center text-red-400 text-lg mb-4">{errorProfile}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white font-inter">
        <p className="text-center text-gray-400 text-lg mb-4">No profile data available.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white font-inter">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-red-600 mb-6">User Profile</h1>

        {/* Combined Update Form */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-500">Manage Account</h2>
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="your.email@example.com"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Current Password Field (for password change) */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">
                Current Password (required to change password)
              </label>
              <input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                aria-invalid={errors.currentPassword ? "true" : "false"}
              />
              {errors.currentPassword && (
                <p role="alert" className="mt-1 text-sm text-red-400">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                aria-invalid={errors.newPassword ? "true" : "false"}
              />
              {errors.newPassword && (
                <p role="alert" className="mt-1 text-sm text-red-400">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                {...register('confirmNewPassword')}
                className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                aria-invalid={errors.confirmNewPassword ? "true" : "false"}
              />
              {errors.confirmNewPassword && (
                <p role="alert" className="mt-1 text-sm text-red-400">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
