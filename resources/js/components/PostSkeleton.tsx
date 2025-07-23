import React from 'react';

const PostSkeleton = () => {
  return (
    <div className="snap-start h-full w-full relative px-2 py-2 rounded animate-pulse">
      {/* Background image placeholder */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
      </div>

      {/* Top user bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-400 border border-white" />
          <div className="w-24 h-4 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* Right side buttons */}
      <div className="absolute right-4 bottom-1/3 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="p-2 bg-gray-400 rounded-full h-10 w-10" />
          <div className="w-6 h-3 mt-1 bg-gray-400 rounded"></div>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-2 bg-gray-400 rounded-full h-10 w-10" />
          <div className="w-6 h-3 mt-1 bg-gray-400 rounded"></div>
        </div>

        <div className="rounded-full overflow-hidden border-2 border-white h-10 w-10 bg-gray-400"></div>
      </div>

      {/* Bottom caption bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-24 h-3 bg-gray-400 rounded"></div>
          <div className="w-16 h-3 bg-gray-400 rounded"></div>
        </div>
        <div className="w-full h-4 bg-gray-400 rounded mb-1"></div>
        <div className="w-2/3 h-4 bg-gray-400 rounded"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;
