export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="relative h-[60vh] w-full animate-pulse bg-gray-200" />

      {/* Content Skeleton */}
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Title Skeleton */}
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          
          {/* Story Content Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Section Title Skeleton */}
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          
          {/* Section Content Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Section Title Skeleton */}
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          
          {/* Section Content Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </article>
    </main>
  );
} 