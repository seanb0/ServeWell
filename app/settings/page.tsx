import '@/app/globals.css';
import { AssignmentPageButton } from '../components/buttons/AssignmentPage';
import { MinistryCreationButton } from '../components/buttons/MinistryCreationButton';
// import UserSettingsForm from '../components/forms/UserSettingsForm';
import ChurchDetailsForm from '../components/forms/ChurchDetailsForm';
import MinistryDetailsForm from '../components/forms/MinistryDetailsForm';

export default function Settings() {
  return (
    <section className="t-20 min-h-screen flex flex-col">
      <div className="t-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-40">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="grid grid-rows-1 md:grid-rows-2 gap-4 w-full max-w-4xl">
            <AssignmentPageButton />
            <MinistryCreationButton />
          </div>
          <div className="mt-8 w-full max-w-4xl">
            {/* <h1 className="text-2xl text-white font-bold mb-4">Update User Details</h1> */}
            {/* <UserSettingsForm /> */}
            <h1 className="text-2xl text-white font-bold mb-4">Update Church Details</h1>
            <ChurchDetailsForm />
            <h1 className="text-2xl text-white font-bold mb-4">Update Minsitry Details</h1>
            <MinistryDetailsForm />
          </div>
        </div>
      </div>
    </section>
  );
}