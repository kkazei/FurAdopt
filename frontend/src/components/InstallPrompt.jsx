import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const InstallPrompt = ({ className = "" }) => {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [canInstall, setCanInstall] = useState(false);

	useEffect(() => {
		const handler = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setCanInstall(true);
		};

		window.addEventListener("beforeinstallprompt", handler);

		const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
		if (isStandalone) {
			setCanInstall(false);
		}

		return () => {
			window.removeEventListener("beforeinstallprompt", handler);
		};
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setCanInstall(false);
		}
		setDeferredPrompt(null);
	};

	if (!canInstall) return null;

	return (
		<div className={`install-banner ${className}`}>
			<div>
				<p className="install-title">Install FurAdopt</p>
				<p className="install-copy">Add the app to your home screen for faster chat and updates.</p>
			</div>
			<button className="install-btn" onClick={handleInstall}>
				<Download size={18} />
				<span>Install</span>
			</button>
		</div>
	);
};

export default InstallPrompt;
