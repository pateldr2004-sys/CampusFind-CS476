
function validateName(name) {
    let nameRegEx = /^[a-zA-Z\s]+$/;
    
    if (nameRegEx.test(name))
        return true;
    else
        return false;
}
 
function validateEmail(email) {
    let emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegEx.test(email))
        return true;
    else
        return false;
}
 
function validatePWD(pwd) {
    if (pwd.length >= 8)
        return true;
    else
        return false;
}
 
function validatePhone(phone) {
    let phoneRegEx = /^[\d\-\s()\.+]+$/;
    let digitsOnly = phone.replace(/\D/g, '');
    
    if (phoneRegEx.test(phone) && digitsOnly.length >= 10)
        return true;
    else
        return false;
}
 
function validateDate(date) {
    let dateRegEx = /^\d{4}[-]\d{2}[-]\d{2}$/;
    
    if (dateRegEx.test(date))
        return true;
    else
        return false;
}
 
function validateFile(file) {
    let fileRegEx = /^[^\n]+\.[a-zA-Z]{3,4}$/;
    
    if (fileRegEx.test(file))
        return true;
    else
        return false;
}
 
function validateDescription(desc) {
    if (!desc)
        return true;
    
    if (desc.trim().length >= 10)
        return true;
    else
        return false;
}
 
function validateCategories(value) {
    if (!value || value === 'Select a category')
        return false;
    else
        return true;
}
 
 
function nameHandler(event) {
    let nameInput = event.target;
    if (!validateName(nameInput.value)) {
        console.log("'" + nameInput.value + "' is not a valid name");
        nameInput.classList.add("error-highlight");
        if (document.getElementById("error-text-name")) {
            document.getElementById("error-text-name").classList.remove("hidden");
        }
    } else {
        nameInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-name")) {
            document.getElementById("error-text-name").classList.add("hidden");
        }
    }
}
 
function emailHandler(event) {
    let emailInput = event.target;
    if (!validateEmail(emailInput.value)) {
        console.log("'" + emailInput.value + "' is not a valid email");
        emailInput.classList.add("error-highlight");
        if (document.getElementById("error-text-email")) {
            document.getElementById("error-text-email").classList.remove("hidden");
        }
    } else {
        emailInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-email")) {
            document.getElementById("error-text-email").classList.add("hidden");
        }
    }
}
 
function pwdHandler(event) {
    let pwd = event.target;
    if (!validatePWD(pwd.value)) {
        console.log("Password should be at least 8 characters long");
        pwd.classList.add("error-highlight");
        if (document.getElementById("error-text-password")) {
            document.getElementById("error-text-password").classList.remove("hidden");
        }
    } else {
        pwd.classList.remove("error-highlight");
        if (document.getElementById("error-text-password")) {
            document.getElementById("error-text-password").classList.add("hidden");
        }
    }
}
 
function phoneHandler(event) {
    let phoneInput = event.target;
    if (!validatePhone(phoneInput.value)) {
        console.log("'" + phoneInput.value + "' is not a valid phone number");
        phoneInput.classList.add("error-highlight");
        if (document.getElementById("error-text-phone")) {
            document.getElementById("error-text-phone").classList.remove("hidden");
        }
    } else {
        phoneInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-phone")) {
            document.getElementById("error-text-phone").classList.add("hidden");
        }
    }
}
 
function dateHandler(event) {
    let dateInput = event.target;
    if (!validateDate(dateInput.value)) {
        console.log("'" + dateInput.value + "' is not a valid date");
        dateInput.classList.add("error-highlight");
        if (document.getElementById("error-text-date")) {
            document.getElementById("error-text-date").classList.remove("hidden");
        }
    } else {
        dateInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-date")) {
            document.getElementById("error-text-date").classList.add("hidden");
        }
    }
}
 
function fileHandler(event) {
    let fileInput = event.target;
    if (fileInput.value && !validateFile(fileInput.value)) {
        console.log("'" + fileInput.value + "' is not a valid file");
        fileInput.classList.add("error-highlight");
        if (document.getElementById("error-text-file")) {
            document.getElementById("error-text-file").classList.remove("hidden");
        }
    } else {
        fileInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-file")) {
            document.getElementById("error-text-file").classList.add("hidden");
        }
    }
}
 
function descriptionHandler(event) {
    let descInput = event.target;
    if (!validateDescription(descInput.value)) {
        console.log("Description should be at least 10 characters");
        descInput.classList.add("error-highlight");
        if (document.getElementById("error-text-description")) {
            document.getElementById("error-text-description").classList.remove("hidden");
        }
    } else {
        descInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-description")) {
            document.getElementById("error-text-description").classList.add("hidden");
        }
    }
}
 
function categHandler(event) {
    let catInput = event.target;
    if (!validateCategories(catInput.value)) {
        console.log("Please select a valid category");
        catInput.classList.add("error-highlight");
        if (document.getElementById("error-text-category")) {
            document.getElementById("error-text-category").classList.remove("hidden");
        }
    } else {
        catInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-category")) {
            document.getElementById("error-text-category").classList.add("hidden");
        }
    }
}
 
 
function validateLogin(event) {
    let form = event.target;
    let emailInput = form.querySelector('input[type="email"]');
    let pwdInput = form.querySelector('input[type="password"]');
    
    let formIsValid = true;
    
    if (emailInput && !validateEmail(emailInput.value)) {
        emailInput.classList.add("error-highlight");
        if (document.getElementById("error-text-email")) {
            document.getElementById("error-text-email").classList.remove("hidden");
        }
        formIsValid = false;
    } else if (emailInput) {
        emailInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-email")) {
            document.getElementById("error-text-email").classList.add("hidden");
        }
    }
    
    if (pwdInput && !pwdInput.value) {
        pwdInput.classList.add("error-highlight");
        if (document.getElementById("error-text-password")) {
            document.getElementById("error-text-password").classList.remove("hidden");
        }
        formIsValid = false;
    } else if (pwdInput) {
        pwdInput.classList.remove("error-highlight");
        if (document.getElementById("error-text-password")) {
            document.getElementById("error-text-password").classList.add("hidden");
        }
    }
    
    if (!formIsValid) {
        event.preventDefault();
    } else {
        console.log("Validation successful, sending data to the server");
    }
}
 
function validateSignup(event) {
    let form = event.target;
    let nameInput = form.querySelector('input[type="text"]');
    let emailInput = form.querySelector('input[type="email"]');
    let pwdInputs = form.querySelectorAll('input[type="password"]');
    let phoneInput = form.querySelector('input[type="tel"]');
    let fileInput = form.querySelector('input[type="file"]');
    
    let formIsValid = true;
    
    if (nameInput && !validateName(nameInput.value)) {
        nameInput.classList.add("error-highlight");
        if (document.getElementById("error-text-name")) {
            document.getElementById("error-text-name").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (emailInput && !validateEmail(emailInput.value)) {
        emailInput.classList.add("error-highlight");
        if (document.getElementById("error-text-email")) {
            document.getElementById("error-text-email").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (pwdInputs[0] && !validatePWD(pwdInputs[0].value)) {
        pwdInputs[0].classList.add("error-highlight");
        if (document.getElementById("error-text-password")) {
            document.getElementById("error-text-password").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    
    if (phoneInput && !validatePhone(phoneInput.value)) {
        phoneInput.classList.add("error-highlight");
        if (document.getElementById("error-text-phone")) {
            document.getElementById("error-text-phone").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (fileInput && fileInput.value && !validateFile(fileInput.value)) {
        fileInput.classList.add("error-highlight");
        if (document.getElementById("error-text-file")) {
            document.getElementById("error-text-file").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (!formIsValid) {
        event.preventDefault();
    } else {
        console.log("Validation successful, sending data to the server");
    }
}
 
function validateReport(event) {
    let form = event.target;
    let formIsValid = true;
    
    let nameInput = form.querySelector('input[placeholder*="full name"]');
    let emailInput = form.querySelector('input[type="email"]');
    let phoneInput = form.querySelector('input[type="tel"]');
    let catInput = form.querySelector('select');
    let itemInput = form.querySelector('input[placeholder*="Black iPhone"]');
    let dateInput = form.querySelector('input[type="date"]');
    let locationInput = form.querySelector('input[placeholder*="Library"]');
    let fileInput = form.querySelector('input[type="file"]');
    let descInput = form.querySelector('textarea');
    
    if (nameInput && !validateName(nameInput.value)) {
        nameInput.classList.add("error-highlight");
        if (document.getElementById("error-text-name")) {
            document.getElementById("error-text-name").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (emailInput && !validateEmail(emailInput.value)) {
        emailInput.classList.add("error-highlight");
        if (document.getElementById("error-text-email")) {
            document.getElementById("error-text-email").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (phoneInput && !validatePhone(phoneInput.value)) {
        phoneInput.classList.add("error-highlight");
        if (document.getElementById("error-text-phone")) {
            document.getElementById("error-text-phone").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (catInput && !validateCategories(catInput.value)) {
        catInput.classList.add("error-highlight");
        if (document.getElementById("error-text-category")) {
            document.getElementById("error-text-category").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (itemInput && !itemInput.value) {
        itemInput.classList.add("error-highlight");
        if (document.getElementById("error-text-item")) {
            document.getElementById("error-text-item").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (dateInput && !validateDate(dateInput.value)) {
        dateInput.classList.add("error-highlight");
        if (document.getElementById("error-text-date")) {
            document.getElementById("error-text-date").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (locationInput && !locationInput.value) {
        locationInput.classList.add("error-highlight");
        if (document.getElementById("error-text-location")) {
            document.getElementById("error-text-location").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (fileInput && fileInput.value && !validateFile(fileInput.value)) {
        fileInput.classList.add("error-highlight");
        if (document.getElementById("error-text-file")) {
            document.getElementById("error-text-file").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (descInput && !validateDescription(descInput.value)) {
        descInput.classList.add("error-highlight");
        if (document.getElementById("error-text-description")) {
            document.getElementById("error-text-description").classList.remove("hidden");
        }
        formIsValid = false;
    }
    
    if (!formIsValid) {
        event.preventDefault();
    } else {
        console.log("Validation successful, sending data to the server");
    }
}
 
 
document.addEventListener('DOMContentLoaded', () => {
    let loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', validateLogin);
    }
    
    let adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', validateLogin);
    }
    
    let signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', validateSignup);
        
        let nameInput = signupForm.querySelector('input[type="text"]');
        let emailInput = signupForm.querySelector('input[type="email"]');
        let pwdInputs = signupForm.querySelectorAll('input[type="password"]');
        let phoneInput = signupForm.querySelector('input[type="tel"]');
        let fileInput = signupForm.querySelector('input[type="file"]');
        
        if (nameInput) nameInput.addEventListener('blur', nameHandler);
        if (emailInput) emailInput.addEventListener('blur', emailHandler);
        if (pwdInputs[0]) pwdInputs[0].addEventListener('blur', pwdHandler);
        if (phoneInput) phoneInput.addEventListener('blur', phoneHandler);
        if (fileInput) fileInput.addEventListener('blur', fileHandler);
    }
    
    let reportForm = document.getElementById('report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', validateReport);
        
        let nameInput = reportForm.querySelector('input[placeholder*="full name"]');
        let emailInput = reportForm.querySelector('input[type="email"]');
        let phoneInput = reportForm.querySelector('input[type="tel"]');
        let catInput = reportForm.querySelector('select');
        let dateInput = reportForm.querySelector('input[type="date"]');
        let fileInput = reportForm.querySelector('input[type="file"]');
        let descInput = reportForm.querySelector('textarea');
        
        if (nameInput) nameInput.addEventListener('blur', nameHandler);
        if (emailInput) emailInput.addEventListener('blur', emailHandler);
        if (phoneInput) phoneInput.addEventListener('blur', phoneHandler);
        if (catInput) catInput.addEventListener('blur', categHandler);
        if (dateInput) dateInput.addEventListener('blur', dateHandler);
        if (fileInput) fileInput.addEventListener('blur', fileHandler);
        if (descInput) descInput.addEventListener('blur', descriptionHandler);
    }
});
