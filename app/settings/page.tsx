import '@/app/globals.css';
import { AssignmentPageButton } from '../components/buttons/AssignmentPage';
import { MinistryCreationButton } from '../components/buttons/MinistryCreationButton';
import { SuperHomepageButton } from '../components/buttons/SuperHomepageButton';
import UserSettingsForm from '../components/forms/UserSettingsForm';

export default function Settings() {
  return (
    <section className="t-20 min-h-screen flex flex-col">
      <div className="t-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-40">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="grid grid-rows-1 md:grid-rows-2 gap-4 w-full max-w-4xl">
            <AssignmentPageButton />
            <MinistryCreationButton />
            <SuperHomepageButton />
          </div>
          <div className="mt-8 w-full max-w-4xl">
            <h1 className="text-2xl text-white font-bold mb-4">Update User Details</h1>
            <UserSettingsForm />
          </div>
        </div>
      </div>
    </section>
  );
}