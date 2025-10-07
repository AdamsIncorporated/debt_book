import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-800 mb-2">TypeScript React Webpack Starter</h1>
                <p className="text-lg text-gray-700">
                    ✅ Hot reload, TypeScript, and a minimal setup with Webpack
                </p>
            </header>
            <main className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                <p className="text-gray-800">
                    Edit <code className="bg-gray-200 px-1 py-0.5 rounded">src/App.tsx</code> and save to reload.
                </p>
            </main>
        </div>
    );
};

export default App;

