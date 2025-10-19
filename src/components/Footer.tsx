import { FunctionComponent } from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Footer: FunctionComponent = () => {
  const { t } = useTranslation("footer");

  return (
    <footer className="footer mt-auto py-3 bg-body-secondary">
      <Container className="text-center">
        <span>
          {t("text")}
          {process.env.NEXT_PUBLIC_GIT_DESCRIBE || "dev"}
        </span>
      </Container>
    </footer>
  );
};

export default Footer;
