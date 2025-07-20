// frontend/src/app/movies/[id]/loading.tsx

// This file defines the loading UI for the dynamic movie details route ([id]).
// It will be shown automatically by Next.js while the page's data (in page.tsx)
// is being fetched.

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      <p className="ml-4 text-xl">Loading movie details...</p>
    </div>
  );
}