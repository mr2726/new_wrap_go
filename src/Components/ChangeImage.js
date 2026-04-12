import "../App.css";
import { useEffect, useRef, useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { BiSolidFactory } from "react-icons/bi";
import { supabase } from "../data/supabase";

function ChangeImage({title, type, imageField}) {
    const fileInputRef = useRef(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);

    const bucketName = process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || "profile-images";
    const profileImageField = imageField || (type === "profile" ? "profile_image_url" : "company_logo_url");

    useEffect(() => {
        const loadCurrentImage = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select(profileImageField)
                .eq("userid", user.id)
                .single();

            if (error) {
                console.log(error.message);
                return;
            }

            if (data?.[profileImageField]) {
                setImageUrl(data[profileImageField]);
            }
        };

        loadCurrentImage();
    }, [profileImageField]);

    const handleOpenFilePicker = () => {
        if (uploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
            setStatus({ type: "error", text: "Only JPG, PNG or GIF files are allowed." });
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setStatus({ type: "error", text: "Image size must be 2MB or less." });
            event.target.value = "";
            return;
        }

        setUploading(true);
        setStatus(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setStatus({ type: "error", text: "You need to sign in to upload an image." });
                return;
            }

            const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const filePath = `${user.id}/${type}-${Date.now()}-${safeFileName}`;

            const { error: uploadError } = await supabase
                .storage
                .from(bucketName)
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.log(uploadError.message);
                setStatus({ type: "error", text: "Failed to upload image to storage." });
                return;
            }

            const { data: publicData } = supabase
                .storage
                .from(bucketName)
                .getPublicUrl(filePath);

            const publicUrl = publicData?.publicUrl;
            if (!publicUrl) {
                setStatus({ type: "error", text: "Failed to get image URL." });
                return;
            }

            const { error: profileError } = await supabase
                .from("profiles")
                .update({ [profileImageField]: publicUrl })
                .eq("userid", user.id);

            if (profileError) {
                console.log(profileError.message);
                setStatus({ type: "error", text: "Image uploaded, but failed to save URL in profile." });
                return;
            }

            setImageUrl(publicUrl);
            setStatus({ type: "success", text: "Image uploaded successfully." });
        } catch (error) {
            console.log(error);
            setStatus({ type: "error", text: "Unexpected error while uploading image." });
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    return (
        <div className="change-image">
            <div className="change-image__header">
                <h2 className="change-image__title title">{title}</h2>
                <p className="change-image__description description">Upload a new image to update your profile picture.</p>
            </div>
            <div className="change-image__content">
                <div className="image__">
                    {imageUrl ? (
                        <img src={imageUrl} alt={`${type} preview`} className="image__preview" />
                    ) : (
                        type === "profile" ? <FaRegUser /> : <BiSolidFactory />
                    )}
                </div>
                <div className="change-image__buttons">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                    <button
                        type="button"
                        className="change-image__button change-image__button--upload"
                        onClick={handleOpenFilePicker}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload New Image"}
                    </button>
                    <p>JPG, PNG or GIF. Max size 2MB</p>
                    {status?.type === "success" && <p className="settings-form__status settings-form__status--success">{status.text}</p>}
                    {status?.type === "error" && <p className="settings-form__status settings-form__status--error">{status.text}</p>}
                </div>
            </div>

        </div>
    );
}

export default ChangeImage;