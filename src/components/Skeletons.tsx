import React from 'react';

const Shimmer = ({ className, key }: { className: string; key?: any }) => (
  <div key={key} className={`shimmer bg-sand-200 rounded-xl ${className}`} />
);

export const TourSkeleton = () => (
  <div className="min-w-[85vw] md:min-w-[350px] lg:min-w-[400px] snap-center rounded-2xl overflow-hidden bg-sand-50 border border-sand-100 flex flex-col">
    <div className="relative aspect-[4/3] overflow-hidden">
      <div className="w-full h-full shimmer bg-sand-200" />
      <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-full w-12 h-12 shimmer" />
    </div>
    <div className="p-8 flex flex-col flex-grow space-y-4">
      <Shimmer className="h-8 w-3/4" />
      <div className="space-y-2">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
      </div>
      <div className="space-y-3 pt-6 border-t border-sand-200">
        <div className="flex justify-between">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Shimmer className="h-4 w-12" />
          <Shimmer className="h-4 w-24" />
        </div>
      </div>
      <Shimmer className="h-12 w-full mt-4" />
    </div>
  </div>
);

export const GallerySkeleton = () => (
  <div className="min-w-[80vw] md:min-w-[400px] snap-center rounded-[2rem] overflow-hidden aspect-[9/11] bg-sand-100 relative shadow-lg">
    <div className="w-full h-full shimmer bg-sand-200" />
  </div>
);

export const TestimonialSkeleton = () => (
  <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Shimmer key={i} className="w-5 h-5" />
      ))}
    </div>
    <div className="space-y-2">
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-2/3" />
    </div>
    <Shimmer className="h-4 w-32" />
  </div>
);
