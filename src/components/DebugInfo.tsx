import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DeviceInfoType } from "edilkamin";
import { Highlight, themes } from "prism-react-renderer";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DebugInfo = ({ info }: { info: DeviceInfoType | null }) => {
  const { t } = useTranslation("stove");
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(info, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 z-10 p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
              aria-label={t("deviceInfo.copy")}
            >
              <FontAwesomeIcon
                icon={copied ? "check" : "copy"}
                className="h-4 w-4"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {copied ? t("deviceInfo.copied") : t("deviceInfo.copy")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="overflow-y-auto max-h-96">
        <Highlight theme={themes.vsDark} code={jsonString} language="json">
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={style} className="p-4 rounded text-sm">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};

export default DebugInfo;
