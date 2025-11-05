    // ---------------------------
    // FORM VALIDATION HELPERS
    // ---------------------------

    const validator = {
    name(value) {
        return /^[A-Za-z ]{2,}$/.test(value.trim());
    },
    age(value) {
        const n = parseInt(value);
        return !isNaN(n) && n > 0;
    },
    gender(value) {
        return value.trim() !== "";
    },
    contact(value) {
        return /^[0-9]{10}$/.test(value.trim());
    },
    email(value) {
        if (value.trim() === "") return true; // optional
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
    }
    };

    window.validator = validator;

    
