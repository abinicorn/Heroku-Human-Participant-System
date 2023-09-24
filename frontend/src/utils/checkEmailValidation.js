export function checkEmailValidation(email) {
    if (!email) return false;  // Check if email is empty or null or undefined
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}
