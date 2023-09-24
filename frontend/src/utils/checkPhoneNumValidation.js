export function checkPhoneNumValidation(phoneNum) {
    const regex = /^(\+)?[\d\s-]+$/;
    return regex.test(phoneNum);
}