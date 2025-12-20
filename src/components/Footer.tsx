import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

const Footer: FunctionComponent = () => {
  const { t } = useTranslation("footer");

  return (
    <footer className="mt-auto py-3 bg-secondary">
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
