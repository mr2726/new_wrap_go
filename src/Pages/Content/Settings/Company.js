import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";
import pageData from "../../../data/data.json";

function Company({_companyData}) {
    const companyText = pageData.content.settings.companyPage;

    return (
        <div className="settings__block">
            <ChangeImage title={companyText.changeImageTitle} type="company" />
            <SettingsForm title={companyText.formTitle} description={companyText.formDescription} data={_companyData} />
        </div>
    );
}

export default Company;