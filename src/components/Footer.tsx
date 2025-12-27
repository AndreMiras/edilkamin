import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation("footer");

  return (
    <footer className="mt-auto py-3 bg-secondary -mb-[env(safe-area-inset-bottom)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <span className="text-secondary-foreground">
          {t("text")}
          {process.env.NEXT_PUBLIC_GIT_DESCRIBE || "dev"}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
