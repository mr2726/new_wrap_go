import "../../App.css";
import { useState } from "react";
import { MdAlternateEmail, MdOutlineCall } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";

function Contacts({data}) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState({ type: "", message: "" });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmitResult({ type: "", message: "" });

        try {
            console.log("Form Data:", formData); // Send to Telegram
            const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
            const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;

            const messageText = `New Contact Form Submission:\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\nMessage: ${formData.message}`;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: messageText
                })
            });

            setSubmitResult({ type: "success", message: data.form.success });
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch {
            setSubmitResult({ type: "error", message: data.form.error });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderIcon = (iconName) => {
        if (iconName === "email") return <MdAlternateEmail />;
        if (iconName === "phone") return <MdOutlineCall />;
        return <FaMapMarkerAlt />;
    };

    const renderValue = (value) => {
        return value.split(/<br\s*\/?\s*>/i).map((line, index) => (
            <span key={`${line}-${index}`}>
                {index > 0 && <br />}
                {line}
            </span>
        ));
    };

    return (
        <div className="contact">
            <div className="contact__header">
                <p className="contact__header--label">{data.header.label}</p>
                <h1 className="contact__header--title title">{data.header.title}</h1>
                <p className="contact__header--description description">{data.header.description}</p>
            </div>
            <div className="contact__content">
                <div className="contact__content--form">
                    <form className="contact__form" onSubmit={handleSubmit}>
                        <label htmlFor="name" className="contact__form--label signup_form__form--label">{data.form.fields.name.label}</label>
                        <input id="name" name="name" placeholder={data.form.fields.name.placeholder} className="contact__form--input signup_form__form--input" required value={formData.name} onChange={handleChange} />
                        <label htmlFor="email" className="contact__form--label signup_form__form--label">{data.form.fields.email.label}</label>
                        <input id="email" name="email" placeholder={data.form.fields.email.placeholder} className="contact__form--input signup_form__form--input" type="email" required value={formData.email} onChange={handleChange} />
                        <label htmlFor="subject" className="contact__form--label signup_form__form--label">{data.form.fields.subject.label}</label>
                        <input id="subject" name="subject" placeholder={data.form.fields.subject.placeholder} className="contact__form--input signup_form__form--input" required value={formData.subject} onChange={handleChange} />
                        <label htmlFor="message" className="contact__form--label signup_form__form--label">{data.form.fields.message.label}</label>
                        <textarea id="message" name="message" placeholder={data.form.fields.message.placeholder} className="contact__form--textarea" required value={formData.message} onChange={handleChange}></textarea>
                        <button type="submit" className="contact__form--button signup_form__form--button" disabled={isSubmitting}>
                            {isSubmitting ? data.form.sending : data.form.send}
                        </button>
                        {submitResult.message && (
                            <p
                                className="signup_form__description"
                                style={{ marginTop: "10px", color: submitResult.type === "success" ? "#5ad48a" : "#ff7f7f" }}
                            >
                                {submitResult.message}
                            </p>
                        )}
                    </form>
                </div>
                <div className="contact__content--info">
                    {data.info.map((item) => (
                        <div className="contact__content--info__item" key={item.id}>
                            <div className="contact__content--info__item--image">{renderIcon(item.icon)}</div>
                            <div className="contact__content--info__item--details">
                                <h3 className="contact__content--info__item--title">{item.title}</h3>
                                <p className="contact__content--info__item--email">{renderValue(item.value)}</p>
                                <p className="contact__content--info__item--workingtime">{item.meta}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Contacts;