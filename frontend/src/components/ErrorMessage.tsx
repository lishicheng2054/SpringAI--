export default function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-red-600 text-sm mb-5 leading-relaxed">{message}</p>
        {onRetry && (
          <button onClick={onRetry}
            className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all shadow-sm">
            重新尝试
          </button>
        )}
      </div>
    </div>
  )
}
