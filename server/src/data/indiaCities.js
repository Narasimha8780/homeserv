// Seed data: major cities grouped by state/UT. `state` strings must match
// src/data/indianStates.ts on the frontend exactly (used for state-based filtering).
// Not an exhaustive gazetteer — any city missing here can be added on the fly
// by customers/captains through the "add my city" flow, via POST /api/cities.

export const INDIA_CITIES = [
  // Andhra Pradesh
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', population: '2.3M', tier: 'Tier 2' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', population: '1.5M', tier: 'Tier 2' },
  { name: 'Guntur', state: 'Andhra Pradesh', population: '0.8M', tier: 'Semi-Urban' },
  { name: 'Nellore', state: 'Andhra Pradesh', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Tirupati', state: 'Andhra Pradesh', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Kurnool', state: 'Andhra Pradesh', population: '0.5M', tier: 'Semi-Urban' },
  { name: 'Kakinada', state: 'Andhra Pradesh', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Rajahmundry', state: 'Andhra Pradesh', population: '0.3M', tier: 'Semi-Urban' },

  // Arunachal Pradesh
  { name: 'Itanagar', state: 'Arunachal Pradesh', population: '0.06M', tier: 'Semi-Urban' },
  { name: 'Naharlagun', state: 'Arunachal Pradesh', population: '0.03M', tier: 'Semi-Urban' },
  { name: 'Pasighat', state: 'Arunachal Pradesh', population: '0.03M', tier: 'Semi-Urban' },
  { name: 'Tawang', state: 'Arunachal Pradesh', population: '0.01M', tier: 'Semi-Urban' },

  // Assam
  { name: 'Guwahati', state: 'Assam', population: '1.1M', tier: 'Tier 2' },
  { name: 'Silchar', state: 'Assam', population: '0.2M', tier: 'Semi-Urban' },
  { name: 'Dibrugarh', state: 'Assam', population: '0.15M', tier: 'Semi-Urban' },
  { name: 'Jorhat', state: 'Assam', population: '0.15M', tier: 'Semi-Urban' },
  { name: 'Tezpur', state: 'Assam', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Nagaon', state: 'Assam', population: '0.2M', tier: 'Semi-Urban' },

  // Bihar
  { name: 'Patna', state: 'Bihar', population: '2.1M', tier: 'Tier 2' },
  { name: 'Gaya', state: 'Bihar', population: '0.5M', tier: 'Semi-Urban' },
  { name: 'Bhagalpur', state: 'Bihar', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Muzaffarpur', state: 'Bihar', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Darbhanga', state: 'Bihar', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Purnia', state: 'Bihar', population: '0.3M', tier: 'Semi-Urban' },

  // Chhattisgarh
  { name: 'Raipur', state: 'Chhattisgarh', population: '1.1M', tier: 'Tier 2' },
  { name: 'Bhilai', state: 'Chhattisgarh', population: '1.1M', tier: 'Tier 2' },
  { name: 'Bilaspur', state: 'Chhattisgarh', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Korba', state: 'Chhattisgarh', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Durg', state: 'Chhattisgarh', population: '0.3M', tier: 'Semi-Urban' },

  // Goa
  { name: 'Panaji', state: 'Goa', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Margao', state: 'Goa', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Vasco da Gama', state: 'Goa', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Mapusa', state: 'Goa', population: '0.05M', tier: 'Semi-Urban' },

  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', population: '8.0M', tier: 'Tier 1' },
  { name: 'Surat', state: 'Gujarat', population: '6.1M', tier: 'Tier 1' },
  { name: 'Vadodara', state: 'Gujarat', population: '2.1M', tier: 'Tier 2' },
  { name: 'Rajkot', state: 'Gujarat', population: '1.4M', tier: 'Tier 2' },
  { name: 'Bhavnagar', state: 'Gujarat', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Jamnagar', state: 'Gujarat', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Gandhinagar', state: 'Gujarat', population: '0.3M', tier: 'Semi-Urban' },

  // Haryana
  { name: 'Gurugram', state: 'Haryana', population: '1.1M', tier: 'Tier 2' },
  { name: 'Faridabad', state: 'Haryana', population: '1.4M', tier: 'Tier 2' },
  { name: 'Panipat', state: 'Haryana', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Ambala', state: 'Haryana', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Hisar', state: 'Haryana', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Karnal', state: 'Haryana', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Rohtak', state: 'Haryana', population: '0.4M', tier: 'Semi-Urban' },

  // Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', population: '0.2M', tier: 'Semi-Urban' },
  { name: 'Manali', state: 'Himachal Pradesh', population: '0.03M', tier: 'Semi-Urban' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', population: '0.02M', tier: 'Semi-Urban' },
  { name: 'Solan', state: 'Himachal Pradesh', population: '0.05M', tier: 'Semi-Urban' },
  { name: 'Mandi', state: 'Himachal Pradesh', population: '0.03M', tier: 'Semi-Urban' },

  // Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', population: '1.1M', tier: 'Tier 2' },
  { name: 'Jamshedpur', state: 'Jharkhand', population: '0.7M', tier: 'Semi-Urban' },
  { name: 'Dhanbad', state: 'Jharkhand', population: '1.2M', tier: 'Tier 2' },
  { name: 'Bokaro', state: 'Jharkhand', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Hazaribagh', state: 'Jharkhand', population: '0.2M', tier: 'Semi-Urban' },

  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', population: '13.2M', tier: 'Tier 1' },
  { name: 'Mysuru', state: 'Karnataka', population: '1.0M', tier: 'Tier 2' },
  { name: 'Mangaluru', state: 'Karnataka', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Hubballi', state: 'Karnataka', population: '0.9M', tier: 'Tier 2' },
  { name: 'Belagavi', state: 'Karnataka', population: '0.5M', tier: 'Semi-Urban' },
  { name: 'Davanagere', state: 'Karnataka', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Shivamogga', state: 'Karnataka', population: '0.3M', tier: 'Semi-Urban' },

  // Kerala
  { name: 'Thiruvananthapuram', state: 'Kerala', population: '1.0M', tier: 'Tier 2' },
  { name: 'Kochi', state: 'Kerala', population: '2.1M', tier: 'Tier 2' },
  { name: 'Kozhikode', state: 'Kerala', population: '1.0M', tier: 'Tier 2' },
  { name: 'Thrissur', state: 'Kerala', population: '0.8M', tier: 'Semi-Urban' },
  { name: 'Kollam', state: 'Kerala', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Kannur', state: 'Kerala', population: '0.2M', tier: 'Semi-Urban' },

  // Madhya Pradesh
  { name: 'Bhopal', state: 'Madhya Pradesh', population: '1.9M', tier: 'Tier 2' },
  { name: 'Indore', state: 'Madhya Pradesh', population: '2.2M', tier: 'Tier 2' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', population: '1.3M', tier: 'Tier 2' },
  { name: 'Gwalior', state: 'Madhya Pradesh', population: '1.2M', tier: 'Tier 2' },
  { name: 'Ujjain', state: 'Madhya Pradesh', population: '0.5M', tier: 'Semi-Urban' },
  { name: 'Sagar', state: 'Madhya Pradesh', population: '0.3M', tier: 'Semi-Urban' },

  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', population: '12.5M', tier: 'Tier 1' },
  { name: 'Pune', state: 'Maharashtra', population: '7.4M', tier: 'Tier 1' },
  { name: 'Nagpur', state: 'Maharashtra', population: '2.5M', tier: 'Tier 2' },
  { name: 'Nashik', state: 'Maharashtra', population: '1.5M', tier: 'Tier 2' },
  { name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', population: '1.2M', tier: 'Tier 2' },
  { name: 'Thane', state: 'Maharashtra', population: '1.9M', tier: 'Tier 2' },
  { name: 'Solapur', state: 'Maharashtra', population: '1.0M', tier: 'Tier 2' },
  { name: 'Kolhapur', state: 'Maharashtra', population: '0.6M', tier: 'Semi-Urban' },

  // Manipur
  { name: 'Imphal', state: 'Manipur', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Thoubal', state: 'Manipur', population: '0.03M', tier: 'Semi-Urban' },

  // Meghalaya
  { name: 'Shillong', state: 'Meghalaya', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Tura', state: 'Meghalaya', population: '0.06M', tier: 'Semi-Urban' },

  // Mizoram
  { name: 'Aizawl', state: 'Mizoram', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Lunglei', state: 'Mizoram', population: '0.06M', tier: 'Semi-Urban' },

  // Nagaland
  { name: 'Kohima', state: 'Nagaland', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Dimapur', state: 'Nagaland', population: '0.15M', tier: 'Semi-Urban' },

  // Odisha
  { name: 'Bhubaneswar', state: 'Odisha', population: '1.2M', tier: 'Tier 2' },
  { name: 'Cuttack', state: 'Odisha', population: '0.7M', tier: 'Semi-Urban' },
  { name: 'Rourkela', state: 'Odisha', population: '0.5M', tier: 'Semi-Urban' },
  { name: 'Berhampur', state: 'Odisha', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Sambalpur', state: 'Odisha', population: '0.2M', tier: 'Semi-Urban' },

  // Punjab
  { name: 'Ludhiana', state: 'Punjab', population: '1.6M', tier: 'Tier 2' },
  { name: 'Amritsar', state: 'Punjab', population: '1.2M', tier: 'Tier 2' },
  { name: 'Jalandhar', state: 'Punjab', population: '0.9M', tier: 'Tier 2' },
  { name: 'Patiala', state: 'Punjab', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Mohali', state: 'Punjab', population: '0.2M', tier: 'Semi-Urban' },
  { name: 'Bathinda', state: 'Punjab', population: '0.3M', tier: 'Semi-Urban' },

  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', population: '3.9M', tier: 'Tier 1' },
  { name: 'Jodhpur', state: 'Rajasthan', population: '1.3M', tier: 'Tier 2' },
  { name: 'Udaipur', state: 'Rajasthan', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Kota', state: 'Rajasthan', population: '1.2M', tier: 'Tier 2' },
  { name: 'Ajmer', state: 'Rajasthan', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Bikaner', state: 'Rajasthan', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Alwar', state: 'Rajasthan', population: '0.3M', tier: 'Semi-Urban' },

  // Sikkim
  { name: 'Gangtok', state: 'Sikkim', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Namchi', state: 'Sikkim', population: '0.02M', tier: 'Semi-Urban' },

  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', population: '7.1M', tier: 'Tier 1' },
  { name: 'Coimbatore', state: 'Tamil Nadu', population: '1.6M', tier: 'Tier 2' },
  { name: 'Madurai', state: 'Tamil Nadu', population: '1.5M', tier: 'Tier 2' },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', population: '1.0M', tier: 'Tier 2' },
  { name: 'Salem', state: 'Tamil Nadu', population: '0.8M', tier: 'Semi-Urban' },
  { name: 'Tirunelveli', state: 'Tamil Nadu', population: '0.5M', tier: 'Semi-Urban' },
  { name: 'Vellore', state: 'Tamil Nadu', population: '0.5M', tier: 'Semi-Urban' },

  // Telangana
  { name: 'Hyderabad', state: 'Telangana', population: '6.8M', tier: 'Tier 1' },
  { name: 'Warangal', state: 'Telangana', population: '0.8M', tier: 'Semi-Urban' },
  { name: 'Nizamabad', state: 'Telangana', population: '0.3M', tier: 'Semi-Urban' },
  { name: 'Karimnagar', state: 'Telangana', population: '0.3M', tier: 'Semi-Urban' },

  // Tripura
  { name: 'Agartala', state: 'Tripura', population: '0.4M', tier: 'Semi-Urban' },
  { name: 'Udaipur', state: 'Tripura', population: '0.05M', tier: 'Semi-Urban' },

  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', population: '2.8M', tier: 'Tier 2' },
  { name: 'Kanpur', state: 'Uttar Pradesh', population: '2.9M', tier: 'Tier 2' },
  { name: 'Agra', state: 'Uttar Pradesh', population: '1.6M', tier: 'Tier 2' },
  { name: 'Varanasi', state: 'Uttar Pradesh', population: '1.4M', tier: 'Tier 2' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', population: '1.5M', tier: 'Tier 2' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', population: '1.7M', tier: 'Tier 2' },
  { name: 'Noida', state: 'Uttar Pradesh', population: '0.6M', tier: 'Tier 2' },
  { name: 'Meerut', state: 'Uttar Pradesh', population: '1.4M', tier: 'Tier 2' },
  { name: 'Bareilly', state: 'Uttar Pradesh', population: '0.9M', tier: 'Semi-Urban' },

  // Uttarakhand
  { name: 'Dehradun', state: 'Uttarakhand', population: '0.8M', tier: 'Semi-Urban' },
  { name: 'Haridwar', state: 'Uttarakhand', population: '0.2M', tier: 'Semi-Urban' },
  { name: 'Nainital', state: 'Uttarakhand', population: '0.04M', tier: 'Semi-Urban' },
  { name: 'Rishikesh', state: 'Uttarakhand', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Haldwani', state: 'Uttarakhand', population: '0.2M', tier: 'Semi-Urban' },

  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', population: '4.5M', tier: 'Tier 1' },
  { name: 'Howrah', state: 'West Bengal', population: '1.1M', tier: 'Tier 2' },
  { name: 'Durgapur', state: 'West Bengal', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Asansol', state: 'West Bengal', population: '0.6M', tier: 'Semi-Urban' },
  { name: 'Siliguri', state: 'West Bengal', population: '0.7M', tier: 'Semi-Urban' },

  // Andaman and Nicobar Islands
  { name: 'Port Blair', state: 'Andaman and Nicobar Islands', population: '0.1M', tier: 'Semi-Urban' },

  // Chandigarh
  { name: 'Chandigarh', state: 'Chandigarh', population: '1.1M', tier: 'Tier 2' },

  // Dadra and Nagar Haveli and Daman and Diu
  { name: 'Silvassa', state: 'Dadra and Nagar Haveli and Daman and Diu', population: '0.1M', tier: 'Semi-Urban' },
  { name: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu', population: '0.05M', tier: 'Semi-Urban' },

  // Delhi
  { name: 'New Delhi', state: 'Delhi', population: '11.0M', tier: 'Tier 1' },
  { name: 'Dwarka', state: 'Delhi', population: '1.1M', tier: 'Tier 2' },
  { name: 'Rohini', state: 'Delhi', population: '1.0M', tier: 'Tier 2' },

  // Jammu and Kashmir
  { name: 'Srinagar', state: 'Jammu and Kashmir', population: '1.3M', tier: 'Tier 2' },
  { name: 'Jammu', state: 'Jammu and Kashmir', population: '0.6M', tier: 'Semi-Urban' },

  // Ladakh
  { name: 'Leh', state: 'Ladakh', population: '0.03M', tier: 'Semi-Urban' },
  { name: 'Kargil', state: 'Ladakh', population: '0.02M', tier: 'Semi-Urban' },

  // Lakshadweep
  { name: 'Kavaratti', state: 'Lakshadweep', population: '0.01M', tier: 'Semi-Urban' },

  // Puducherry
  { name: 'Puducherry', state: 'Puducherry', population: '0.7M', tier: 'Semi-Urban' },
  { name: 'Karaikal', state: 'Puducherry', population: '0.1M', tier: 'Semi-Urban' },
];
