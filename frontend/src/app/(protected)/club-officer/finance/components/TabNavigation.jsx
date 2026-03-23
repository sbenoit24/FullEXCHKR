'use client';


export function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex w-full gap-1 bg-gray-200 p-1 rounded-full">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}