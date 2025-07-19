export default function FloatingElements() {
  return (
    <>
      {/* Floating Coffee Beans */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-4 h-6 bg-amber-800 rounded-full opacity-15 animate-pulse transform rotate-12"></div>
        <div className="absolute top-40 right-20 w-3 h-5 bg-orange-900 rounded-full opacity-10 animate-bounce transform -rotate-12"></div>
        <div className="absolute bottom-32 left-1/4 w-5 h-7 bg-red-900 rounded-full opacity-8 animate-pulse transform rotate-45"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-6 bg-amber-700 rounded-full opacity-20 animate-bounce transform -rotate-45"></div>
        <div className="absolute bottom-20 right-10 w-3 h-5 bg-orange-800 rounded-full opacity-15 animate-pulse transform rotate-24"></div>
        <div className="absolute top-16 left-1/2 w-4 h-6 bg-red-800 rounded-full opacity-12 animate-bounce transform -rotate-24"></div>
      </div>

      {/* Cel-shaded Steam Effects */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100/20 to-transparent pointer-events-none z-0">
        <div className="absolute top-4 left-1/4 w-1.5 h-8 bg-orange-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-6 left-1/3 w-1 h-6 bg-amber-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-3 left-1/2 w-1.5 h-10 bg-orange-300 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute top-8 right-1/3 w-1 h-7 bg-amber-300 rounded-full opacity-35 animate-bounce"></div>
        <div className="absolute top-2 right-1/4 w-1.5 h-9 bg-orange-200 rounded-full opacity-30 animate-pulse"></div>
      </div>
    </>
  );
}
