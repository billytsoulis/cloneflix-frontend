// frontend/src/app/watchlist/loading.tsx

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      <p className="ml-4 text-xl">Loading watchlist...</p>
    </div>
  );
}
