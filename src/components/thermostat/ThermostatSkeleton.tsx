const ThermostatSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 animate-pulse">
      <div className="w-[340px] bg-card text-card-foreground rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
        {/* Power button skeleton */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-24 rounded-full bg-muted" />
        </div>

        {/* Power level slider skeleton */}
        <div className="mb-4">
          <div className="h-8 w-full rounded bg-muted" />
        </div>

        {/* Status indicator skeleton */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-6 w-6 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>

        {/* Temperature display skeleton */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2">
            <div className="h-6 w-6 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ThermostatSkeleton };
