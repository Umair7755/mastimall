export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card p-3">
      <div className="skeleton aspect-square rounded-media" />
      <div className="skeleton mt-3 h-5 w-4/5 rounded-full" />
      <div className="skeleton mt-2 h-4 w-1/2 rounded-full" />
      <div className="skeleton mt-4 h-12 rounded-full" />
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[1920px] grid-cols-2 gap-3 px-2 py-6 sm:px-3 lg:grid-cols-4 lg:px-4 xl:px-5">
      {Array.from({ length: 8 }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1920px] space-y-5 px-2 py-5 sm:px-3 lg:px-4 xl:px-5">
      <div className="skeleton h-[42vh] rounded-shell lg:h-96" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="skeleton h-40 rounded-card" />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="skeleton h-36 w-36 shrink-0 rounded-full" />
        ))}
      </div>
    </div>
  );
}
