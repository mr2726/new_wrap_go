import { useState } from "react";
import "../App.css";

function PrivacyPolicy({data, onBack}) {

    const [active, setActive] = useState("acceptance");

    const handleClick = (id) => {
        setActive(id);
        const element = document.getElementById(id);
        if(element){
            element.scrollIntoView({behavior: "smooth"});
        }
    }

    return(
        <div className="terms_privacy">
            <div className="wrapper">
                <div className="terms__herder--content">
                    <div className="tag"><p>{data.tag}</p></div>
                    <h1 className="terms__header--title">{data.title}</h1>
                    <p className="terms__header--description">{data.description}</p>
                </div>
                <div className="terms__content">
                    <div className="terms__content--links">
                        <div className="terms__content--links--fix">
                            <p className="back" onClick={onBack}>{data.backBTN}</p>
                            {
                                data.content.map((item, index) => (
                                    <p key={index} onClick={() => handleClick(item.id)} className={`terms__content--links_link ${active === item.id ? "terms__content--links_link--active" : ""}`}>{item.link}</p>
                                ))
                            }
                        </div>
                    </div>
                    <div className="terms__content--content">
                        {
                            data.content.map((item, index) => (
                                <div className="terms__contetn--content--term">
                                    <h3 className="terms__contetn--content--term--title" id={item.id}><span className="highlight">{item.title[0]}</span> {item.title[1]}</h3>
                                    <p className="terms__content--content--term--body">{item.body}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy;