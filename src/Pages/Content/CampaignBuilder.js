import { useState } from "react";
import "../../App.css";
import { MdOutlineCalculate, MdUploadFile  } from "react-icons/md";
import PlanSelector from "../../Components/PlanSelector";
import AdPlacement from "../../Components/AdPlacement";
import Modal from "../../Components/Moda";
import Loader from "../../Components/Loader";
import {
  getLastInvoiceByPrefix,
  uploadDocument,
  getDocumentUrl,
  getSession,
  insertCampaign,
  insertAnalitics,
  insertInvoice,
} from "../../data/service";
import { getOriginalCampaignStartDate } from "../../data/campaignDates";


function CampaignBuilder({data}) {
    const [standartValue, setStandartValue] = useState(0);
    const [economValue, setEconomValue] = useState(1);
    const [route, setRoute] = useState("3m");
    const [adPlacement, setAdPlacement] = useState("side");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [customSelected, setCustomSelected] = useState(false);
    const [launchError, setLaunchError] = useState("");

    const multiplier = route === "1m" ? 1 : route === "3m" ? 3 : route === "6m" ? 6 : route;
    const priceStandart = adPlacement === "side" ? 109000 : 169000;
    const priceBusiness = 175000;
    const baseTotal = ((economValue * priceStandart) + (standartValue * priceBusiness)) * multiplier;
    // Discount logic: 2% for 3 months, 5% for 6 months, 5% for 6+ months, 3% for 3-6 months
    const discountPercent = route === "3m" ? 0.03 : route === "6m" ? 0.05 : route >= 6 ? 0.05 : route >=3 && route <= 6 ? 0.03 : 0;
    const discountAmount = baseTotal * discountPercent;
    const discountedTotal = baseTotal - discountAmount;

    const formatNumber = (num) => num.toLocaleString('en-US');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleBrowseClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleCustomDurationChange = (e) => {
        let rawValue = e.target.value;

        if (rawValue === "") {
            setRoute(1);
            return;
        }

        if(rawValue.length > 1 && rawValue.startsWith("0")) {
            rawValue = rawValue.replace(/^0+/, "");
            const parsedValue = Number.parseInt(rawValue, 10);
            setRoute(Number.isNaN(parsedValue) || parsedValue <= 0 ? 1 : parsedValue);
        } else {
            const parsedValue = Number.parseInt(rawValue, 10);
            setRoute(Number.isNaN(parsedValue) || parsedValue <= 0 ? 1 : parsedValue);
        }
    };

    const generateInvoiceId = async () => {
        const currentYear = new Date().getFullYear();
        const prefix = `INV-${currentYear}-`;

        const { data: invoiceRows, error } = await getLastInvoiceByPrefix(prefix);

        if (error) {
            console.error("Invoice id read error:", error);
            return `${prefix}001`;
        }

        const lastInvoiceId = invoiceRows?.[0]?.invoiceid;
        if (!lastInvoiceId) {
            return `${prefix}001`;
        }

        const lastNumber = Number(lastInvoiceId.split("-")[2]);
        const nextNumber = Number.isNaN(lastNumber) ? 1 : lastNumber + 1;
        return `${prefix}${String(nextNumber).padStart(3, "0")}`;
    };

    const handleLaunchCampaign = async () => {
        if (isLaunching) return;
        setLaunchError("");

        if (!productName.trim()) {
            setLaunchError(data.alerts.productNameRequired);
            return;
        }
        if (!uploadedFile) {
            setLaunchError(data.alerts.fileRequired);
            return;
        }

        setIsLaunching(true);

        try {
            let fileUrl = null;

            // ===== 1. Загрузка файла =====
            if (uploadedFile) {
                const file = uploadedFile;
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2)}.${fileExt}`;
                const filePath = `campaign-docs/${fileName}`;

                const { error: uploadError } = await uploadDocument(filePath, file);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    return;
                }

                // ===== 2. Получаем публичную ссылку =====
                const { data: publicUrlData } = getDocumentUrl(filePath);

                fileUrl = publicUrlData.publicUrl;
            }

            // ===== 3. Подготовка данных =====
            const { data: { session } } = await getSession();

            const userId = session?.user?.id;
            const createdAt = new Date().toISOString();
            const payload = {
                ownerid : userId,
                name: productName,
                description: productDescription,
                duration: route,
                reclamtype: adPlacement,
                economValue,
                standartValue,
                status: "pending",
                city : "Yerevan",
                driverCount: 0,
                document: fileUrl, // ссылка на файл
                budget: discountedTotal,
                original_start_at: getOriginalCampaignStartDate({ created_at: createdAt }).toISOString(),
            };

            // ===== 4. Запись в таблицу =====
            const { data, error } = await insertCampaign(payload);

            if (error) {
                console.error("Insert error:", error);
                return;
            }

            // ===== 5. Запись в таблицу аналитики =====
            const newCampaignId = data[0]?.id;
            if (newCampaignId) {
                const defaultToday = Array.from({ length: 24 }, (_, i) => ({
                    name: `${String(i).padStart(2, "0")}:00`,
                    distance: 0,
                    impressions: 0,
                }));
                const defaultWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(name => ({
                    name, distance: 0, impressions: 0,
                }));
                const defaultMonth = Array.from({ length: 30 }, (_, i) => ({
                    name: String(i + 1),
                    distance: 0,
                    impressions: 0,
                }));
                const defaultYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(name => ({
                    name, distance: 0, impressions: 0,
                }));

                const { error: analyticsError } = await insertAnalitics({
                        campaign_id: newCampaignId,
                        owner_id: userId,
                        today: defaultToday,
                        week: defaultWeek,
                        month: defaultMonth,
                        year: defaultYear,
                    });

                if (analyticsError) {
                    console.error("Analytics insert error:", analyticsError);
                }

                // ===== 6. Запись в таблицу инвойсов =====
                const invoiceId = await generateInvoiceId();
                const invoicePayload = {
                    invoiceid: invoiceId,
                    campaign_id: newCampaignId,
                    owner_id: userId,
                    amount: Math.round(discountedTotal),
                    campaign_name: productName,
                    status: "pending",
                };

                const { error: invoiceError } = await insertInvoice(invoicePayload);

                if (invoiceError) {
                    console.error("Invoice insert error:", invoiceError);
                }
            }

            // ===== 7. Сброс данных =====
            setStandartValue(0);
            setEconomValue(0);
            setRoute("3m");
            setAdPlacement("side");
            setUploadedFile(null);
            setProductName("");
            setProductDescription("");

            setModalOpen(true);
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setIsLaunching(false);
        }
    };

    return(
        <div className="campaign">
            {isLaunching && <Loader />}
            <div className="campaign__content">
                <div className="campaign__content--header">
                    <h2 className="campaign__content--header--title signup_form__title">{data.title}</h2>
                    <p className="campaign__content--header--description signup_content_container__description">{data.description}</p>
                </div>
                <div className="campaign__content--content">


                    <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <div className="campaign__content--content--blocks">
                            <div className="campaign__content--content--block">
                                <img 
                                    src={require("../../assets/car.png")}
                                    width={300}
                                    className="block__img"
                                    alt="car"
                                />
                                <div className="block__title">
                                    <p className="block__title--title">{data.campaigns[0].title}</p>
                                    <p className="block__title--data">{priceStandart/1000}K {data.campaigns[0].price}</p>
                                </div>
                                <div className="block__info">
                                    <p className="block__info--title">{data.campaigns[0].info.title}</p>
                                    <p className="block__info--data">{data.campaigns[0].info.data}</p>
                                </div>
                                <div className="block__quantity">
                                    <p className="block__quantity--title">{data.campaigns[0].quantity}</p>
                                    <input
                                        type="number"
                                        value={economValue <= 1 ? 1 : economValue}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            if (isNaN(val)) return;
                                            setEconomValue(Math.min(Math.max(val, 1), 15));
                                        }}
                                        min={1}
                                        max={15}
                                        className="block__input"
                                    />
                                </div>
                            </div>

                            <div className="campaign__content--content--block blocked">
                                <h1 className="blocked__text">{data.commingSoon}</h1>
                                <img 
                                    // src={data.campaigns[1].img}
                                    src={require("../../assets/car.png")}
                                    width={300}
                                    className="block__img"
                                    alt="car"
                                />
                                <div className="block__title">
                                    <p className="block__title--title">{data.campaigns[1].title}</p>
                                    <p className="block__title--data">{data.campaigns[1].price}</p>
                                </div>
                                <div className="block__info">
                                    <p className="block__info--title">{data.campaigns[1].info.title}</p>
                                    <p className="block__info--data">{data.campaigns[1].info.data}</p>
                                </div>
                                <div className="block__quantity">
                                    <p className="block__quantity--title">{data.campaigns[1].quantity}</p>
                                    <input 
                                        type="number" 
                                        value={standartValue <= 0 ? 0 : standartValue} 
                                        onChange={(e) => setStandartValue(e.target.value <=0 ? 0 : e.target.value)}
                                        className="block__input"
                                    />
                                </div>
                            </div>

                            

                        </div>
                        <div className="campaign__settings">
                            <PlanSelector setRoute={setRoute} route={route} setCustomSelected={setCustomSelected}/>
                            <AdPlacement setSelected={setAdPlacement} selected={adPlacement} />
                        </div>

                        {/* INFO */}
                        <div className="info">
                            
                            {
                                customSelected && (
                                    <div className="inputandlable">
                                        <label htmlFor="customDuration" className="info__label">{data.infoForm.customDurationLabel}</label>
                                        <input
                                            id="customDuration"
                                            name="customDuration"
                                            placeholder={data.infoForm.customDurationPlaceholder}
                                            className="info__input"
                                            required
                                            value={route <= 0 ? 0 : route}
                                            onChange={handleCustomDurationChange}
                                            type="number"
                                        />
                                    </div>
                                )
                            }
                            <div className="inputandlable">
                                <label htmlFor="productName" className="info__label">{data.infoForm.productNameLabel}</label>
                                <input
                                    id="productName"
                                    name="productName"
                                    placeholder={data.infoForm.productNamePlaceholder}
                                    className="info__input"
                                    required
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    style={{textTransform: "capitalize"}}
                                />
                            </div>
                            <div className="inputandlable">
                                <label htmlFor="productDescription" className="info__label">{data.infoForm.productDescriptionLabel}</label>
                                <textarea
                                    id="productDescription"
                                    name="productDescription"
                                    placeholder={data.infoForm.productDescriptionPlaceholder}
                                    className="info__textarea"
                                    required
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                />
                            </div>
                        </div>


                        <div className="draganddrop">
                            <MdUploadFile className="dragIcon" />
                            <p className="drag_title">{data.image.title}</p>
                            <p className="description">{data.image.description}</p>
                            <button className="brouseFile" onClick={handleBrowseClick}>{data.image.browse}</button>
                            <input 
                                type="file" 
                                id="fileInput" 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange} 
                                accept=".ai,.svg,.png,.pdf"
                            />
                            {uploadedFile && <p className="uploaded-file">{data.image.uploadedPrefix} {uploadedFile.name}</p>}
                        </div>
                    </div>

                    <div className="campaign__builder">
                        <div className="campaign__builder--title">
                            <MdOutlineCalculate className="icon" />
                            <p className="campaign__builder--title--title">{data.builder.title}</p>
                        </div>
                        <div className="campaign__builder--info">
                            <p className="campaign__builder--info--title">{data.builder.start}{economValue} ({multiplier} months)</p>
                            <p className="campaign__builder--info--data">{formatNumber(economValue * priceStandart * multiplier)} {data.builder.sufix}</p>
                        </div>
                        <div className="campaign__builder--info">
                            <p className="campaign__builder--info--title">{data.builder.subtotal}</p>
                            <p className="campaign__builder--info--data">{formatNumber(baseTotal)} {data.builder.sufix}</p>
                        </div>
                        {discountPercent > 0 && (
                            <div className="campaign__builder--info">
                                <p className="campaign__builder--info--title">{data.builder.discount} ({route === "3m" ? data.builder.periodLabels["3m"] : data.builder.periodLabels["6m"]})</p>
                                <p className="campaign__builder--info--data">-{formatNumber(Math.round(discountAmount))} {data.builder.sufix} ({discountPercent * 100}%)</p>
                            </div>
                        )}
                        <div className="campaign__builder--total">
                            <p className="campaign__builder--total--title">{data.builder.calc}</p>
                            <p className="campaign__builder--total--data">
                                {customSelected ? `${formatNumber(Math.round(discountedTotal))} ` : `${formatNumber(Math.round(discountedTotal))} `}
                                <span className="campaign__builder--total--data--article">{data.builder.sufix}</span>
                            </p>
                        </div>

                        {launchError && <p className="signup_form__error" style={{marginBottom: "0.5em"}}>{launchError}</p>}
                        <button
                            className="campaign__builder--button overview__header--button"
                            onClick={handleLaunchCampaign}
                            disabled={isLaunching}
                        >
                            {isLaunching ? data.builder.btnLoading : data.builder.btn}
                        </button>
                    </div>
                </div>
            </div>
            {
                modalOpen && <Modal setModalOpen={setModalOpen} data={data.modal} />
            }
        
        </div>
    )
}

export default CampaignBuilder;
