export default function PackSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-32 sm:h-48 bg-gray-200 relative">
        <div className="absolute top-3 left-3 bg-gray-300 rounded-full w-16 h-6"></div>
        <div className="absolute top-3 right-3 bg-gray-300 rounded-full w-12 h-6"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="ml-3 w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        
        {/* Pack Skeletons */}
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="ml-3 text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
