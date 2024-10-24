interface LoaderProps {
    isDarkMode: boolean;
  }
  
  const Loader: React.FC<LoaderProps> = ({ isDarkMode }) => {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="relative">
          <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${
            isDarkMode 
              ? 'border-gray-600' 
              : 'border-gray-300'
          }`}></div>
          <div className={`absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin`} 
               style={{ animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  };
  
  export default Loader;