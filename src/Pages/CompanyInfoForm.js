import "../App.css";
import Logo from "../Components/Logo";
import { supabase } from "../data/supabase";

function CompanyInfo ({data, setPage, setEmail, credentials}) {
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const filledValues = {};

        formData.forEach((value, key) => {
            if (typeof value === "string" && value.trim() !== "") {
                filledValues[key] = value.trim();
            }
        });

        // 1. Регистрация аккаунта
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                emailRedirectTo: `${process.env.REACT_APP_WEB_URL}/`
            }
        });

        if (signUpError) {
            console.log("Signup Error:", signUpError.message);
            return;
        }

        const user = signUpData?.user;
        if (!user) return;

        // 2. Полная запись профиля в БД
        const { error: insertError } = await supabase
            .from("profiles")
            .insert([
                {
                    userid: user.id,
                    name: filledValues.fullname,
                    email: credentials.email,
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

        // 3. Убиваем сессию до подтверждения email
        await supabase.auth.signOut();

        if (setEmail) setEmail(credentials.email);
        setPage("confirm-email");
    };

    return (
        <div className="companyInfo">
            <div className="comapnyInfo__content">
                <div className="companyInfo__content--header">
                    
                    <Logo setPage={setPage} />
                    <div style={{marginTop: "20px"}}>
                        <h1 className="title">{data.header.title}</h1>
                        <p className="description">{data.header.description}</p>
                    </div>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <h2 className="subtitle">{data.sections.contact}</h2>
                    <label htmlFor="fullname" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.fullName.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="fullname"
                        name="fullname"
                        placeholder={data.fields.fullName.placeholder}
                        required
                        type="text"
                    />
                    <label htmlFor="email" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.email.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="email"
                        name="email"
                        placeholder={data.fields.email.placeholder}
                        type="email"
                        value={credentials.email}
                        required
                        disabled
                    />
                    <label htmlFor="phone" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.phone.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="phone"
                        name="phone"
                        placeholder={data.fields.phone.placeholder}
                        type="numeric"
                        required
                    />
                    <h2 className="subtitle">{data.sections.company}</h2>
                    <label htmlFor="name" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.companyName.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="name"
                        name="name"
                        placeholder={data.fields.companyName.placeholder}
                        type="text"
                        required
                    />
                    <label htmlFor="industry" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.industry.label}</label>
                    <select id="industry" name="industry" required defaultValue="">
                        <option value="" disabled hidden>{data.fields.industry.placeholder}</option>
                        {data.fields.industry.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <h2 className="subtitle">{data.sections.address}</h2>
                    <label htmlFor="street" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.street.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="street"
                        name="street"
                        placeholder={data.fields.street.placeholder}
                        type="text"
                        required
                    />

                    <label htmlFor="country" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.country.label}</label>
                    <select id="country" name="country" required defaultValue="">
                        <option value="" disabled hidden>{data.fields.country.placeholder}</option>
                        {data.fields.country.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <h2 className="subtitle">{data.sections.additional}</h2>
                    <label htmlFor="web" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.website.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="web"
                        name="web"
                        placeholder={data.fields.website.placeholder}
                        type="text"
                    />
                    <label htmlFor="tax" style={{marginLeft: 0}} className="signup_form__terms--label">{data.fields.tax.label}</label>
                    <input 
                        className="signup_form__form--input"
                        id="tax"
                        name="tax"
                        placeholder={data.fields.tax.placeholder}
                        type="text"
                    />

                    <button type="submit" className="signup_form__form--button">
                        {data.button}
                    </button>
                    <div className="terms__block" style={{margin: "30px auto 0 auto", fontSize: "15px"}}>
                        <p className="terms" onClick={() => setPage("privacy")}>{data.footerLinks.terms}</p>
                        <p className="terms" onClick={() => setPage("terms")}>{data.footerLinks.privacy}</p>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default CompanyInfo;