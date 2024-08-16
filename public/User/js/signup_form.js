document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const fNameInput = document.getElementById('fName');
    const lNameInput = document.getElementById('lName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const mobileInput = document.getElementById('mobile');
    
    // Add references to the error span elements for each input
    const fNameError = document.getElementById('fName_error');
    const lNameError = document.getElementById('lName_error');
    const emailError = document.getElementById('email_error');
    const passwordError = document.getElementById('password_error');
    const mobileError = document.getElementById('mobile_error');

    signupForm.addEventListener('submit', function (event) {
        let valid = true;

        // Reset all error messages
        fNameError.textContent = '';
        lNameError.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';
        mobileError.textContent = '';

        

        // Validation for fName and lName
        const nameRegex = /^[A-Za-z]+$/;
        if (fNameInput.value.length > 16 || !nameRegex.test(fNameInput.value)) {
            fNameError.textContent = 'First Name should have a maximum of 16 letters, no spaces, and only letters are allowed.';
            valid = false;
        }
        if (lNameInput.value.length > 16 || !nameRegex.test(lNameInput.value)) {
            lNameError.textContent = 'Last Name should have a maximum of 16 letters, no spaces, and only letters are allowed.';
            valid = false;
        }

        // Validation for email
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = 'Please enter a valid email address.';
            valid = false;
        }

        // Validation for password
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(passwordInput.value)) {
            passwordError.textContent = 'Password should have at least 8 characters, including a special character and a number.';
            valid = false;
        }

        // Validation for mobile number
        const mobileRegex = /^[2-9]\d{9}$/;
        if (!mobileRegex.test(mobileInput.value)) {
            mobileError.textContent = 'Mobile number should have exactly 10 digits and should not start with 0, 1, or 3.';
            valid = false;
        }

        // Check for empty inputs
        if (fNameInput.value.trim() === '') {
            fNameError.textContent = 'First Name cannot be empty.';
            valid = false;
        }
        if (lNameInput.value.trim() === '') {
            lNameError.textContent = 'Last Name cannot be empty.';
            valid = false;
        }
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Email cannot be empty.';
            valid = false;
        }
        if (passwordInput.value.trim() === '') {
            passwordError.textContent = 'Password cannot be empty.';
            valid = false;
        }
        if (mobileInput.value.trim() === '') {
            mobileError.textContent = 'Mobile Number cannot be empty.';
            valid = false;
        }

        if (!valid) {
            event.preventDefault();
        }

        
    });
});