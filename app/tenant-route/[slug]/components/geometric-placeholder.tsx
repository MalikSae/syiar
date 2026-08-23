export function GeometricPlaceholder({ name }: { name?: string }) {
  return (
    <div className="w-full h-full bg-site-bg relative flex items-center justify-center overflow-hidden">
      {/* SVG Geometric Pattern with Brand-500 thin lines */}
      <svg
        className="absolute inset-0 w-full h-full text-brand-500 opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 400 400"
      >
        <defs>
          <pattern
            id="geometric-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 20 L20 0 L40 20 L20 40 Z"
              stroke="currentColor"
              strokeWidth="0.75"
              fill="none"
            />
            <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <path
              d="M0 0 L40 40 M40 0 L0 40"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="1 3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geometric-grid)" />
      </svg>

      {/* Subtle brand border ring */}
      <div className="relative z-10 text-center p-4">
        <div className="w-12 h-12 rounded-xl border border-brand-500/30 bg-white/60 backdrop-blur-xs mx-auto flex items-center justify-center">
          <div className="w-5 h-5 border-t-2 border-r-2 border-brand-500 rotate-45" />
        </div>
      </div>
    </div>
  )
}
