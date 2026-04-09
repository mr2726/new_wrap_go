import "../App.css";
import Logo from "../Components/Logo";
import { supabase } from "../data/supabase";

function CompanyInfo ({setPage, email}) {
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const filledValues = {};

        formData.forEach((value, key) => {
            if (typeof value === "string" && value.trim() !== "") {
                filledValues[key] = value.trim();
            }
        });

        console.log("Filled form values:", filledValues);
        // send data to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Запись в БД
        const { error: insertError } = await supabase
            .from("profiles")
            .insert([
                {
                    userid: user.id,
                    name: filledValues.fullname,
                    email: email,
                    balance: 0,
                    country: filledValues.country,
                    industry: filledValues.industry,
                    companyname: filledValues.name,
                    phone: filledValues.phone,
                    street: filledValues.street,
                    tax: filledValues.tax,
                    web: filledValues.web, 
                }
            ]);

        if (insertError) {
            console.log("Insert Error:", insertError.message);
        }
        setPage("content")
    };

    return (
        <div className="companyInfo">
            <div className="comapnyInfo__content">
                <div className="companyInfo__content--header">
                    
                    <Logo setPage={setPage} />
                    <div style={{marginTop: "20px"}}>
                        <h1 className="title">Company Info</h1>
                        <p className="description">Please fill all company Info</p>
                    </div>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <h2 className="subtitle">Contact Info</h2>
                    <label htmlFor="fullname" style={{marginLeft: 0}} className="signup_form__terms--label">Full Name</label>
                    <input 
                        className="signup_form__form--input"
                        id="fullname"
                        name="fullname"
                        placeholder="Full Name"
                        required
                        type="text"
                    />
                    <label htmlFor="email" style={{marginLeft: 0}} className="signup_form__terms--label">Business Email</label>
                    <input 
                        className="signup_form__form--input"
                        id="email"
                        name="email"
                        placeholder="Enter business contact email"
                        type="email"
                        value={email}
                        required
                        disabled
                    />
                    <label htmlFor="phone" style={{marginLeft: 0}} className="signup_form__terms--label">Phone Number</label>
                    <input 
                        className="signup_form__form--input"
                        id="phone"
                        name="phone"
                        placeholder="Enter phone number with country code"
                        type="numeric"
                        required
                    />
                    <h2 className="subtitle">Company Info</h2>
                    <label htmlFor="name" style={{marginLeft: 0}} className="signup_form__terms--label">Company Name</label>
                    <input 
                        className="signup_form__form--input"
                        id="name"
                        name="name"
                        placeholder="Enter your company name"
                        type="text"
                        required
                    />
                    <label htmlFor="industry" style={{marginLeft: 0}} className="signup_form__terms--label">Industry</label>
                    <select id="industry" name="industry" required>
                        <option value="" selected disabled hidden>Select your industry</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                    </select>
                    <h2 className="subtitle">Address</h2>
                    <label htmlFor="street" style={{marginLeft: 0}} className="signup_form__terms--label">Street Address</label>
                    <input 
                        className="signup_form__form--input"
                        id="street"
                        name="street"
                        placeholder="Enter street address"
                        type="text"
                        required
                    />

                    <label htmlFor="country" style={{marginLeft: 0}} className="signup_form__terms--label">Country</label>
                    <select id="country" name="country" required>
                        <option value="" selected disabled hidden>Select country</option>
                        <option value="Armenia">Armenia</option>
                        <option value="Georgia">Georgia</option>
                        <option value="UAE">UAE</option>
                        <option value="Other">Other</option>
                    </select>
                    <h2 className="subtitle">Additional Info</h2>
                    <label htmlFor="web" style={{marginLeft: 0}} className="signup_form__terms--label">Website URL (Optional)</label>
                    <input 
                        className="signup_form__form--input"
                        id="web"
                        name="web"
                        placeholder="Enter website URL"
                        type="text"
                    />
                    <label htmlFor="tax" style={{marginLeft: 0}} className="signup_form__terms--label">Tax ID or registration number (Optional)</label>
                    <input 
                        className="signup_form__form--input"
                        id="tax"
                        name="tax"
                        placeholder="Enter Tax ID or registration number"
                        type="text"
                    />

                    <button type="submit" className="signup_form__form--button">
                        Continue
                    </button>
                    <div className="terms__block" style={{margin: "30px auto 0 auto", fontSize: "15px"}}>
                        <p className="terms" onClick={() => setPage("privacy")}>Terms of service</p>
                        <p className="terms" onClick={() => setPage("terms")}>Privacy & Policy</p>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default CompanyInfo;