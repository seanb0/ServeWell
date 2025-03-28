'use client';
import '@/app/globals.css';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function ChurchCreationForm() {
    const {user} = useUser();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        churchName: '',
        denomination: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        state: '',
        admin: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        middleName: '',
        lastName: '',
        username: '',
        phoneNumber: '',
    });

    // Add state to store the registered church info
    const [registeredChurch, setRegisteredChurch] = useState({
        id: '',
        name: ''
    });

    // Add state to store church_id
    const [churchId, setChurchId] = useState<number | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        if (e.target.type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement; // Type assertion for checkbox
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };
    

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handlePrevious = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleChurchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formattedCity = `${formData.city}, ${formData.state}`;
        const churchData = {
            churchName: formData.churchName,
            denomination: formData.denomination,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formattedCity,
        };

        try {
            const response = await fetch('/api/churches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(churchData)
            });

            if (response.ok) {
                const result = await response.json();
                setChurchId(result['churchId']);
                setRegisteredChurch({
                    id: result['churchId'],
                    name: formData.churchName
                });
                setStep(3);
            } else {
                alert('Failed to register the church.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        }
    };

    const handleSuperAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!churchId) {
            console.error('No church ID available'); // Debug log
            alert('Failed to register SuperAdmin. Church ID is missing!');
            return;
        }

        const superAdminData = {
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            username: formData.username,
            password: formData.password,
            church_id: churchId,  // Add the stored church_id
            auth0ID: user?.sub,
        };

        console.log('Sending SuperAdmin data:', superAdminData); // Debug log

        try {
            const response = await fetch('/api/superadmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(superAdminData),
            });
            
            if (response.ok) {
                alert('SuperAdmin registered successfully!');
                window.location.href = '/';
            } else {
                const error = await response.json();
                console.error('Registration failed:', error);
                alert('Failed to register SuperAdmin.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        }
    };

    // Calculate progress (percentage based on current step)
    const progress = (step - 1) * 50; // 3 steps, so each step is 50%

    return (
        <div className="container mx-auto p-4">
            <div className="bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-blue-300 h-full" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <form onSubmit={handleChurchSubmit}>
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Church Details</h2>
                            <input
                                type="text"
                                name="churchName"
                                placeholder="Church Name"
                                value={formData.churchName}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                name="denomination"
                                placeholder="Denomination"
                                value={formData.denomination}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                            />
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Next
                            </button>
                            <a href="/" className="text-blue-500 hover:underline ml-4">Back to Home</a>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                name="postalCode"
                                placeholder="Postal Code"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            >
                                <option value="" disabled>Select State</option>
                                <option value="AL">Alabama</option>
                                <option value="AK">Alaska</option>
                                <option value="AZ">Arizona</option>
                                <option value="AR">Arkansas</option>
                                <option value="CA">California</option>
                                <option value="CO">Colorado</option>
                                <option value="CT">Connecticut</option>
                                <option value="DE">Delaware</option>
                                <option value="FL">Florida</option>
                                <option value="GA">Georgia</option>
                                <option value="HI">Hawaii</option>
                                <option value="ID">Idaho</option>
                                <option value="IL">Illinois</option>
                                <option value="IN">Indiana</option>
                                <option value="IA">Iowa</option>
                                <option value="KS">Kansas</option>
                                <option value="KY">Kentucky</option>
                                <option value="LA">Louisiana</option>
                                <option value="ME">Maine</option>
                                <option value="MD">Maryland</option>
                                <option value="MA">Massachusetts</option>
                                <option value="MI">Michigan</option>
                                <option value="MN">Minnesota</option>
                                <option value="MS">Mississippi</option>
                                <option value="MO">Missouri</option>
                                <option value="MT">Montana</option>
                                <option value="NE">Nebraska</option>
                                <option value="NV">Nevada</option>
                                <option value="NH">New Hampshire</option>
                                <option value="NJ">New Jersey</option>
                                <option value="NM">New Mexico</option>
                                <option value="NY">New York</option>
                                <option value="NC">North Carolina</option>
                                <option value="ND">North Dakota</option>
                                <option value="OH">Ohio</option>
                                <option value="OK">Oklahoma</option>
                                <option value="OR">Oregon</option>
                                <option value="PA">Pennsylvania</option>
                                <option value="RI">Rhode Island</option>
                                <option value="SC">South Carolina</option>
                                <option value="SD">South Dakota</option>
                                <option value="TN">Tennessee</option>
                                <option value="TX">Texas</option>
                                <option value="UT">Utah</option>
                                <option value="VT">Vermont</option>
                                <option value="VA">Virginia</option>
                                <option value="WA">Washington</option>
                                <option value="WV">West Virginia</option>
                                <option value="WI">Wisconsin</option>
                                <option value="WY">Wyoming</option>
                            </select>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Previous
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Register Church
                                </button>
                            </div>
                            <a href="/" className="text-blue-500 hover:underline mt-4 block">Back to Home</a>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">SuperAdmin Registration</h2>
                            
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">Registering SuperAdmin for:</h3>
                                <p className="text-xl font-bold">{registeredChurch.name}</p>
                            </div>

                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                name="middleName"
                                placeholder="Middle Name"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mb-4 p-2 border rounded w-full"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleSuperAdminSubmit}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Register SuperAdmin
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}