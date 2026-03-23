export default function Loading() {
  return (
    <div 
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#122b5b' }}
    >
      <div className="flex flex-col items-center gap-10">
        {/* Elegant rotating rings with gold accent */}
        <div className="relative h-32 w-32">
          {/* Outer glow ring - Sky Blue */}
          <div 
            className="absolute h-full w-full rounded-full animate-pulse"
            style={{ 
              boxShadow: '0 0 40px rgba(184, 223, 255, 0.4)',
              border: '2px solid rgba(184, 223, 255, 0.3)',
              animationDuration: '3s'
            }}
          ></div>
          
          {/* Main spinning ring - Gold gradient */}
          <div 
            className="absolute h-full w-full animate-spin rounded-full"
            style={{ 
              border: '4px solid transparent',
              borderTopColor: '#c39a4e',
              borderRightColor: 'rgba(195, 154, 78, 0.5)',
              animationDuration: '1.2s',
              filter: 'drop-shadow(0 0 8px rgba(195, 154, 78, 0.5))'
            }}
          ></div>
          
          {/* Inner counter-rotating ring - Sky Blue */}
          <div 
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full"
            style={{ 
              border: '3px solid transparent',
              borderBottomColor: '#b8dfff',
              borderLeftColor: 'rgba(184, 223, 255, 0.4)',
              animationDuration: '2s',
              animationDirection: 'reverse'
            }}
          ></div>
          
          {/* Center gold dot */}
          <div 
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full"
            style={{ 
              backgroundColor: '#c39a4e',
              boxShadow: '0 0 20px rgba(195, 154, 78, 0.8)',
              animationDuration: '2s'
            }}
          ></div>
        </div>
        
        {/* Loading text with shimmer effect */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-1">
            <p 
              className="text-2xl font-medium tracking-wide"
              style={{ 
                color: '#ffffff',
                fontFamily: 'Arial, Arimo, sans-serif',
                textShadow: '0 2px 10px rgba(195, 154, 78, 0.3)'
              }}
            >
              EXCHKR
            </p>
            <span className="flex gap-1">
              <span 
                className="animate-bounce text-2xl font-medium"
                style={{ 
                  color: '#c39a4e',
                  animationDelay: '0ms',
                  animationDuration: '1.2s',
                  textShadow: '0 0 10px rgba(195, 154, 78, 0.5)'
                }}
              >.</span>
              <span 
                className="animate-bounce text-2xl font-medium"
                style={{ 
                  color: '#c39a4e',
                  animationDelay: '200ms',
                  animationDuration: '1.2s',
                  textShadow: '0 0 10px rgba(195, 154, 78, 0.5)'
                }}
              >.</span>
              <span 
                className="animate-bounce text-2xl font-medium"
                style={{ 
                  color: '#c39a4e',
                  animationDelay: '400ms',
                  animationDuration: '1.2s',
                  textShadow: '0 0 10px rgba(195, 154, 78, 0.5)'
                }}
              >.</span>
            </span>
          </div>
          
          {/* Subtitle text */}
          <p 
            className="text-sm tracking-wider"
            style={{ 
              color: 'rgba(184, 223, 255, 0.8)',
              fontFamily: 'Arial, Arimo, sans-serif',
              letterSpacing: '0.1em'
            }}
          >
            Loading...
          </p>
        </div>
        
        {/* Sleek progress bar */}
        <div 
          className="w-80 h-1 rounded-full overflow-hidden relative"
          style={{ 
            backgroundColor: 'rgba(184, 223, 255, 0.15)',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div 
            className="h-full rounded-full animate-pulse"
            style={{ 
              background: 'linear-gradient(90deg, transparent 0%, #c39a4e 50%, transparent 100%)',
              animationDuration: '2s',
              boxShadow: '0 0 10px rgba(195, 154, 78, 0.6)'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}