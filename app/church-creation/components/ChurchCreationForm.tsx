'use client';

import { useState } from 'react';
import styles from '../styles/ChurchCreationForm.module.css';

export default function ChurchCreationForm() {
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
                setChurchId(result.church_id); // Store the church_id
                setRegisteredChurch({
                    id: result.id,
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
            console.error('No church ID available');
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
            church_id: churchId  // Add the stored church_id
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
        <div className={styles.container}>
            <div className={styles.topBar}>
                <h1 className={styles.title}>ServeWell</h1>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.formWrapper}>
                    <form onSubmit={handleChurchSubmit}>
                        {step === 1 && (
                            <div>
                                <h2 className={styles.formTitle}>Church Details</h2>
                                <div className={styles.progressBarContainer}>
                                    <div
                                        className={styles.progressBar}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="churchName"
                                    placeholder="Church Name"
                                    value={formData.churchName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    name="denomination"
                                    placeholder="Denomination"
                                    value={formData.denomination}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                                
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={styles.button}
                                >
                                    Next
                                </button>

                                <a href="/" className={styles.backLink}>
                                    Back to Home
                                </a>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 className={styles.formTitle}>Contact Information</h2>
                                <div className={styles.progressBarContainer}>
                                    <div
                                        className={styles.progressBar}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="Postal Code"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            >
                                <option value="" disabled>
                                    Select State
                                </option>
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

                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className={styles.buttonHalf}
                                >
                                    Previous
                                </button>
                                <button
                                    type="submit"
                                    className={styles.buttonHalf}
                                >
                                    Register Church
                                </button>
                            </div>

                            <a href="/" className={styles.backLink}>
                                Back to Home
                            </a>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 className={styles.formTitle}>SuperAdmin Registration</h2>
                                <div className={styles.progressBarContainer}>
                                    <div
                                        className={styles.progressBar}
                                        style={{ width: `100%` }}
                                    />
                                </div>
                                
                                {/* Display registered church name */}
                                <div className={styles.registeredChurchInfo}>
                                    <h3>Registering SuperAdmin for:</h3>
                                    <p className={styles.churchName}>{registeredChurch.name}</p>
                                </div>

                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    name="middleName"
                                    placeholder="Middle Name"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSuperAdminSubmit}
                                    className={styles.button}
                                >
                                    Register SuperAdmin
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}