import clsx from 'clsx';
import '@/app/globals.css';

export default function SuperUserHomepage() {
  return (
    <section className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col bg-blue-500 p-20">
        <div className="flex flex-col items-center justify-center pt-8">
          <h2 className="text-2xl font-bold text-white mb-8">SuperUser Homepage</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            <a href="/adult" className="bg-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105">
              <h3 className="text-xl font-bold mb-2">Adults Ministry</h3>
            </a>
            <a href="/children" className="bg-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105">
              <h3 className="text-xl font-bold mb-2">Children's Ministry</h3>
            </a>
            <a href="/youth" className="bg-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105">
              <h3 className="text-xl font-bold mb-2">Youth Ministry</h3>
            </a>
            <a href="super-homepage/church" className="bg-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105">
              <h3 className="text-xl font-bold mb-2">Church</h3>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}