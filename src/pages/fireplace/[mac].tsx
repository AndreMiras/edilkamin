import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Redirect from old /fireplace/[mac] URLs to new /stove/[mac] URLs.
 * Uses client-side redirect to remain compatible with static export (mobile builds).
 */
const FireplaceRedirect = () => {
  const router = useRouter();
  const mac = router.query.mac as string;

  useEffect(() => {
    if (mac) {
      router.replace(`/stove/${mac}`);
    }
  }, [mac, router]);

  return null;
};

export default FireplaceRedirect;
