export function GeometricPlaceholder({ name }: { name?: string }) {
  return (
    <div className="w-full h-full bg-[#F8F9FA] relative flex items-center justify-center overflow-hidden select-none">
      <img
        src="/syiarlink-placeholder.png"
        alt={name ? `Placeholder ${name}` : 'SyiarLink Package Placeholder'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  )
}
