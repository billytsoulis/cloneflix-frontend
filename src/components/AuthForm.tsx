// frontend/src/app/components/AuthForm.tsx

"use client"; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast'; // Import react-hot-toast
import { registerUser, loginUser } from '../lib/api'; // Adjust path as needed for API calls

// Define the schema for your authentication form validation
const authSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long").min(1, "Password is required"),
});

type AuthFormInputs = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormInputs>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormInputs) => {
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(data);
        toast.success('Login successful!');
        router.push('/'); // Redirect to dashboard or home page
      } else { // mode === 'register'
        await registerUser(data);
        toast.success('Registration successful! Please log in.');
        router.push('/login'); // Redirect to login page after registration
      }
    } catch (error: any) {
      console.error(`${mode === 'login' ? 'Login' : 'Registration'} error:`, error);
      // Access the error message from the backend response if available, otherwise a generic message
      const errorMessage = error.response?.data || error.message || `${mode === 'login' ? 'Login' : 'Registration'} failed.`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'login' ? 'Cloneflix Login' : 'Cloneflix Register';
  const buttonText = mode === 'login' ? (loading ? 'Logging in...' : 'Login') : (loading ? 'Registering...' : 'Register');
  const toggleLinkText = mode === 'login' ? "Don't have an account?" : "Already have an account?";
  const toggleLinkHref = mode === 'login' ? "/register" : "/login";
  const toggleLinkAnchorText = mode === 'login' ? "Sign Up" : "Log In";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4 font-inter">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-red-600">
          {title}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
              placeholder="you@example.com"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p role="alert" className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p role="alert" className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-lg font-semibold rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonText}
          </button>
        </form>
        <p className="text-center text-gray-400">
          {toggleLinkText}{' '}
          <a href={toggleLinkHref} className="text-red-500 hover:underline font-medium">
            {toggleLinkAnchorText}
          </a>
        </p>
      </div>
    </div>
  );
}
