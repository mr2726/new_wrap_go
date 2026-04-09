import { useState } from "react";
import "../../App.css";
import { MdOutlineCalculate, MdUploadFile  } from "react-icons/md";
import PlanSelector from "../../Components/PlanSelector";
import AdPlacement from "../../Components/AdPlacement";
import Modal from "../../Components/Moda";
import { supabase } from "../../data/supabase";


function CampaignBuilder({data}) {
    const [standartValue, setStandartValue] = useState(1);
    const [economValue, setEconomValue] = useState(1);
    const [route, setRoute] = useState("3m");
    const [adPlacement, setAdPlacement] = useState("side");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [modalOpen, setModalOpen] = useState(false);


    const multiplier = route === "1m" ? 1 : route === "3m" ? 3 : route === "6m" ? 6 : 1;
    const priceStandart = adPlacement === "side" ? 129000 : 179000;
    const priceBusiness = 179000;
    const baseTotal = ((economValue * priceStandart) + (standartValue * priceBusiness)) * multiplier;
    const discountPercent = route === "3m" ? 0.02 : route === "6m" ? 0.05 : 0;
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

    const handleLaunchCampaign = async () => {
        // ===== Проверка обязательных полей =====
        if (!productName.trim()) {
            alert("Product Name is required!");
            return;
        }
        if (!uploadedFile) {
            alert("Please upload a file!");
            return;
        }

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

                const { error: uploadError } = await supabase.storage
                    .from('documents') // bucket name
                    .upload(filePath, file, {
                    contentType: file.type,
                });

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    return;
                }

                // ===== 2. Получаем публичную ссылку =====
                const { data: publicUrlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(filePath);

                fileUrl = publicUrlData.publicUrl;
            }

            // ===== 3. Подготовка данных =====
            const { data: { session } } = await supabase.auth.getSession();

            const userId = session?.user?.id;
            const payload = {
                ownerid : userId, // замените на реальный ID пользователя
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
                budget:
                    route === "custom"
                    ? "Will contact with you"
                    : discountedTotal,
            };

            console.log("SENDING:", payload);

            // ===== 4. Запись в таблицу =====
            const { data, error } = await supabase
                .from('campaigns')
                .insert([payload])
                .select();

            if (error) {
                console.error("Insert error:", error);
                return;
            }

            console.log("SUCCESS:", data);

            // ===== 5. Сброс данных =====
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
        }
    };

    return(
        <div className="campaign">
            <div className="campaign__content">
                <div className="campaign__content--header">
                    <h2 className="campaign__content--header--title signup_form__title">{data.title}</h2>
                    <p className="campaign__content--header--description signup_content_container__description">{data.description}</p>
                </div>
                <div className="campaign__content--content">


                    <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <div className="campaign__content--content--blocks">
                            <div className="campaign__content--content--block">
                                {/* <h1 className="blocked__text"></h1> */}
                                <img 
                                    src={data.campaigns[0].img}
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
                                        value={economValue <= 0 ? 0 : economValue } 
                                        onChange={(e) => setEconomValue(e.target.value <=0 ? 0 : e.target.value)}
                                        className="block__input"
                                    />
                                </div>
                            </div>

                            <div className="campaign__content--content--block blocked">
                                <h1 className="blocked__text">{data.commingSoon}</h1>
                                <img 
                                    src={data.campaigns[1].img}
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
                        <div className="settings">
                            <PlanSelector setRoute={setRoute} route={route} />
                            <AdPlacement setSelected={setAdPlacement} selected={adPlacement} />
                        </div>

                        {/* INFO */}
                        <div className="info">
                            <div className="inputandlable">
                                <label htmlFor="productName" className="info__label">Product Name</label>
                                <input
                                    id="productName"
                                    name="productName"
                                    placeholder="Product name"
                                    className="info__input"
                                    required
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>
                            <div className="inputandlable">
                                <label htmlFor="productDescription" className="info__label">Product Description</label>
                                <textarea
                                    id="productDescription"
                                    name="productDescription"
                                    placeholder="Product description"
                                    className="info__textarea"
                                    required
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                />
                            </div>
                        </div>


                        <div className="draganddrop">
                            <MdUploadFile className="dragIcon" />
                            <p className="drag_title">Drop your logo or design here</p>
                            <p className="description">Supports AI, SVG, PNG or PDF (Max 50MB)</p>
                            <button className="brouseFile" onClick={handleBrowseClick}>Browse Files</button>
                            <input 
                                type="file" 
                                id="fileInput" 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange} 
                                accept=".ai,.svg,.png,.pdf"
                            />
                            {uploadedFile && <p className="uploaded-file">Uploaded: {uploadedFile.name}</p>}
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

                        {/* <div className="campaign__builder--info">
                            <p className="campaign__builder--info--title">Business Tier x{standartValue} ({multiplier} months)</p>
                            <p className="campaign__builder--info--data">{formatNumber(standartValue * priceBusiness * multiplier)} AMD</p>
                        </div> */}
                        <div className="campaign__builder--info">
                            <p className="campaign__builder--info--title">{data.builder.subtotal}</p>
                            <p className="campaign__builder--info--data">{formatNumber(baseTotal)} {data.builder.sufix}</p>
                        </div>
                        {discountPercent > 0 && (
                            <div className="campaign__builder--info">
                                <p className="campaign__builder--info--title">{data.builder.discount} ({route === "3m" ? "3 Months" : "6 Months"})</p>
                                <p className="campaign__builder--info--data">-{formatNumber(Math.round(discountAmount))} {data.builder.sufix} ({discountPercent * 100}%)</p>
                            </div>
                        )}
                        <div className="campaign__builder--total">
                            <p className="campaign__builder--total--title">{data.builder.calc}</p>
                            <p className="campaign__builder--total--data">
                                {route === "custom"
                                    ? "Will contact with you"
                                    : `${formatNumber(Math.round(discountedTotal))} `}
                                {route !== "custom" && <span className="campaign__builder--total--data--article">{data.builder.sufix}</span>}
                            </p>
                        </div>

                        <button
                            className="campaign__builder--button overview__header--button"
                            onClick={handleLaunchCampaign}
                        >
                            {data.builder.btn}
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