import { useMemo, useState } from "react";

function SectionShell({ id, children }) {
    return (
        <section id={id} className="landing__section">
            {children}
        </section>
    );
}

function HeroSection({ signup, onCreate }) {
    return (
        <SectionShell id="hero">
            <div className="landing__hero">
                <div className="landing__hero-content landing__fade-in">
                    <p className="landing__pill">{signup.tag}</p>
                    <h1 className="landing__hero-title">
                        {signup.title[0]}
                        <span>{signup.title[1]}</span>
                    </h1>
                    <p className="landing__hero-description">{signup.description}</p>
                    <div className="landing__hero-actions">
                        <button type="button" onClick={onCreate} className="landing__btn landing__btn--primary">
                            Create Account
                        </button>
                        <p className="landing__hero-subcopy">{signup.signup_form.description}</p>
                    </div>
                </div>

                <div className="landing__hero-cards landing__fade-in">
                    <div className="landing__hero-glow" />
                    <div className="landing__grid">
                        {signup.blocks.map((item) => (
                            <article key={item.title} className="landing__card landing__card--muted">
                                <p className="landing__card-title">{item.title}</p>
                                <p className="landing__card-text">{item.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </SectionShell>
    );
}

function TrustSection({ content }) {
    const trustItems = [
        ...content.sidebar.sidebar_pages.slice(0, 3).map((item) => item.title),
        content.overview.title,
    ];

    return (
        <SectionShell id="trust">
            <div className="landing__panel landing__fade-in">
                <p className="landing__kicker landing__kicker--center">{content.overview.description}</p>
                <div className="landing__trust-grid">
                    {trustItems.map((item) => (
                        <div key={item} className="landing__trust-item">
                            {item}
                        </div>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}

function ProblemSolutionSection({ signup, campaigns }) {
    return (
        <SectionShell id="problem-solution">
            <div className="landing__split-grid">
                <article className="landing__card landing__card--large landing__fade-in">
                    <p className="landing__kicker">{signup.tag}</p>
                    <h2 className="landing__section-title">{signup.blocks[0].title}</h2>
                    <p className="landing__card-text">{signup.blocks[0].description}</p>
                </article>
                <article className="landing__card landing__card--large landing__card--muted landing__fade-in">
                    <p className="landing__kicker">{campaigns.title}</p>
                    <h2 className="landing__section-title">{signup.blocks[1].title}</h2>
                    <p className="landing__card-text">{campaigns.discription}</p>
                </article>
            </div>
        </SectionShell>
    );
}

function FeaturesSection({ blocks }) {
    return (
        <SectionShell id="features">
            <div className="landing__stack">
                <h2 className="landing__heading-center">{blocks[0].title}</h2>
                <div className="landing__feature-grid">
                    {blocks.map((feature) => (
                        <article key={feature.title} className="landing__card landing__card--hover landing__fade-in">
                            <p className="landing__card-title">{feature.title}</p>
                            <p className="landing__card-text">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}

function HowItWorks({ campaigns }) {
    const steps = [
        { title: campaigns.title, description: campaigns.discription },
        { title: campaigns.image.title, description: campaigns.image.description },
        { title: campaigns.builder.btn, description: campaigns.modal.description },
    ];

    return (
        <SectionShell id="how-it-works">
            <div className="landing__stack">
                <h2 className="landing__heading-center">{campaigns.builder.title}</h2>
                <div className="landing__step-grid">
                    {steps.map((step, index) => (
                        <article key={step.title} className="landing__card landing__card--hover landing__fade-in">
                            <p className="landing__step-index">0{index + 1}</p>
                            <p className="landing__card-title">{step.title}</p>
                            <p className="landing__card-text">{step.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}

function DashboardPreview({ overview }) {
    return (
        <SectionShell id="dashboard-preview">
            <div className="landing__dashboard landing__fade-in">
                <div className="landing__dashboard-head">
                    <p className="landing__kicker">{overview.title}</p>
                    <p className="landing__dashboard-subtitle">{overview.description}</p>
                </div>
                <div className="landing__dashboard-grid">
                    {overview.overview_stats.map((stat) => (
                        <div key={stat.id} className="landing__dashboard-item">
                            <p className="landing__dashboard-label">{stat.title}</p>
                            <p className="landing__dashboard-value">{stat.aditions}</p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}

function SignUpForm({ signupForm, onGoToSignup, onGoToSignin }) {
    const [form, setForm] = useState(() =>
        Object.fromEntries(signupForm.signup_form_inputs.map((input) => [input.name, ""]))
    );
    const [error, setError] = useState("");

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    const handleSubmit = (event) => {
        event.preventDefault();

        if (form.password !== form.confirmpassword) {
            setError(signupForm.inputErrors.passwordisnotsame);
            return;
        }

        if (!passwordPattern.test(form.password || "")) {
            setError(signupForm.inputErrors.notvalidPassword);
            return;
        }

        setError("");
        onGoToSignup();
    };

    return (
        <article className="landing__card landing__card--large landing__fade-in">
            <p className="landing__form-title">{signupForm.title}</p>
            <p className="landing__form-subtitle">{signupForm.description}</p>

            <form className="landing__form" onSubmit={handleSubmit}>
                {signupForm.signup_form_inputs.map((input) => (
                    <label key={input.name} className="landing__field">
                        <span className="landing__label">{input.lable}</span>
                        <input
                            name={input.name}
                            type={input.type}
                            placeholder={input.placeholder}
                            value={form[input.name]}
                            onChange={(event) => {
                                const { name, value } = event.target;
                                setForm((prev) => ({ ...prev, [name]: value }));
                            }}
                            className="landing__input"
                            required
                        />
                    </label>
                ))}

                <p className="landing__checkbox-note">
                    {signupForm.checkbox[0]}
                    <button type="button" className="landing__inline-link" onClick={onGoToSignup}>
                        {signupForm.checkbox[1]}
                    </button>
                    {signupForm.checkbox[2]}
                    <button type="button" className="landing__inline-link" onClick={onGoToSignup}>
                        {signupForm.checkbox[3]}
                    </button>
                </p>

                {error && <p className="landing__form-error">{error}</p>}

                <button type="submit" className="landing__btn landing__btn--primary landing__btn--full">
                    {signupForm.button}
                </button>
            </form>

            <p className="landing__form-subnote">
                {signupForm.account[0]}
                <button type="button" className="landing__inline-link" onClick={onGoToSignin}>
                    {signupForm.account[1]}
                </button>
            </p>
        </article>
    );
}

function SignInForm({ signin, onGoToSignin }) {
    const [form, setForm] = useState(() => Object.fromEntries(signin.inputs.map((input) => [input.name, ""])));

    return (
        <article className="landing__card landing__card--large landing__card--muted landing__fade-in">
            <p className="landing__form-title">{signin.title}</p>
            <p className="landing__form-subtitle">{signin.description}</p>

            <form
                className="landing__form"
                onSubmit={(event) => {
                    event.preventDefault();
                    onGoToSignin();
                }}
            >
                {signin.inputs.map((input) => (
                    <label key={input.name} className="landing__field">
                        <span className="landing__label">{input.lable}</span>
                        <input
                            name={input.name}
                            type={input.type}
                            placeholder={input.placeholder}
                            value={form[input.name]}
                            onChange={(event) => {
                                const { name, value } = event.target;
                                setForm((prev) => ({ ...prev, [name]: value }));
                            }}
                            className="landing__input landing__input--white"
                            required
                        />
                    </label>
                ))}

                <button type="submit" className="landing__btn landing__btn--outline landing__btn--full">
                    {signin.button}
                </button>
            </form>
        </article>
    );
}

function AuthIntegrationSection({ signup, signin, onGoToSignup, onGoToSignin }) {
    return (
        <SectionShell id="auth-integration">
            <div className="landing__split-grid">
                <SignUpForm signupForm={signup.signup_form} onGoToSignup={onGoToSignup} onGoToSignin={onGoToSignin} />
                <SignInForm signin={signin} onGoToSignin={onGoToSignin} />
            </div>
        </SectionShell>
    );
}

function CTASection({ signup, onCreate }) {
    return (
        <SectionShell id="cta">
            <div className="landing__cta landing__fade-in">
                <p className="landing__kicker">{signup.tag}</p>
                <h2 className="landing__cta-title">
                    {signup.title[0]}
                    <span>{signup.title[1]}</span>
                </h2>
                <p className="landing__cta-description">{signup.description}</p>
                <button type="button" onClick={onCreate} className="landing__btn landing__btn--primary">
                    {signup.signup_form.button}
                </button>
            </div>
        </SectionShell>
    );
}

function Footer({ terms, privacy, signin, onGoTerms, onGoPrivacy, onGoSignin }) {
    return (
        <footer className="landing__footer">
            <div className="landing__footer-inner">
                <p className="landing__footer-note">{privacy.tag}</p>
                <div className="landing__footer-links">
                    <button type="button" onClick={onGoTerms} className="landing__footer-link">
                        {terms.title}
                    </button>
                    <button type="button" onClick={onGoPrivacy} className="landing__footer-link">
                        {privacy.title}
                    </button>
                    <button type="button" onClick={onGoSignin} className="landing__footer-link landing__footer-link--primary">
                        {signin.button}
                    </button>
                </div>
            </div>
        </footer>
    );
}

function Lending({ data, setPage }) {
    const sections = useMemo(
        () => ({
            signup: data.signup,
            signin: data.signin,
            terms: data.terms,
            privacy: data.privacy,
            content: data.content,
        }),
        [data]
    );

    return (
        <main className="landing">
            <HeroSection signup={sections.signup} onCreate={() => setPage("signup")} />
            <TrustSection content={sections.content} />
            <ProblemSolutionSection signup={sections.signup} campaigns={sections.content.campaigns} />
            <FeaturesSection blocks={sections.signup.blocks} />
            <HowItWorks campaigns={sections.content.campaigns} />
            <DashboardPreview overview={sections.content.overview} />
            <AuthIntegrationSection
                signup={sections.signup}
                signin={sections.signin}
                onGoToSignup={() => setPage("signup")}
                onGoToSignin={() => setPage("signin")}
            />
            <CTASection signup={sections.signup} onCreate={() => setPage("signup")} />
            <Footer
                terms={sections.terms}
                privacy={sections.privacy}
                signin={sections.signin}
                onGoTerms={() => setPage("terms")}
                onGoPrivacy={() => setPage("privacy")}
                onGoSignin={() => setPage("signin")}
            />
        </main>
    );
}

export default Lending;
