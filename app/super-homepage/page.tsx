import '@/app/globals.css';
import { getMinistries } from '@/app/lib/data';

export default async function SuperUserHomepage() {
  const ministries = await getMinistries();

  return (
    <section className="t-20 min-h-screen flex flex-col">
      <div className="t-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-40">
        <div className="flex flex-col items-center justify-center pt-8">
          <h2 className="text-2xl font-bold text-white mb-8">SuperUser Homepage</h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl">
              {ministries.map((ministry) => (
                <a
                  key={ministry.ministry_id}
                  href={`/ministry/${ministry.url_path}`}
                  className="bg-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105"
                >
                  <h3 className="text-xl font-bold mb-2">{ministry.ministryname}</h3>
                </a>
              ))}
              <a 
                href="super-homepage/church" 
                className= "bg-white p-6 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105"
              >
                <h3 className="text-xl font-bold mb-2">Church</h3>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}