const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";

export const getImageUrl = (img) => {
	if (!img) return "";
	if (img.startsWith("http://") || img.startsWith("https://")) return img;
	return `${API_BASE}${img}`;
};
