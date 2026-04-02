
const isProfileComplete = (user) => {
  const requiredFields = [
    'user_name', 'email_ad', 'civil_status', 'sex', 
    'birthplace', 'birthdate', 'contact_no', 'national_id',
    'house_no', 'street', 'barangay', 'municipality', 
    'province', 'residence_start_date'
  ];
  
  // Returns true only if every field has a value
  return requiredFields.every(field => user[field] && String(user[field]).trim() !== "");
};

export default isProfileComplete