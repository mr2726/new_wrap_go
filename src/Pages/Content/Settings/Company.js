import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";
import { useLanguage } from "../../../context/LanguageContext";

function Company({_companyData}) {
    const { data: pageData } = useLanguage();
    const companyText = pageData.content.settings.companyPage;

    return (
        <div className="settings__block">
            <ChangeImage title={companyText.changeImageTitle} type="company" />
            <SettingsForm title={companyText.formTitle} description={companyText.formDescription} data={_companyData} />
        </div>
    );
}

export default Company;