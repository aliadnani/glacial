import {
  QrcodeSuccessCallback,
  QrcodeErrorCallback,
  Html5QrcodeScanner,
} from "html5-qrcode";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { useRef, useEffect } from "react";

type scanProps = Html5QrcodeScannerConfig & {
  qrCodeSuccessCallback: QrcodeSuccessCallback;
  verbose?: boolean;
  qrCodeErrorCallback?: QrcodeErrorCallback;
};

const SCAN_REGION_ID = "html5qr-code-full-region";

function Html5QrcodeScannerComponent(props: scanProps) {
  const { qrCodeSuccessCallback, qrCodeErrorCallback, verbose } = props;
  const ref = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Use reference to avoid recreating the object when double rendered in Dev Strict Mode.
    if (ref.current === null) {
      ref.current = new Html5QrcodeScanner(
        SCAN_REGION_ID,
        { ...props },
        verbose,
      );
    }
    const html5QrcodeScanner = ref.current;

    // Timeout to allow the clean-up function to finish in case of double render.
    setTimeout(() => {
      const container = document.getElementById(SCAN_REGION_ID);
      if (html5QrcodeScanner && container?.innerHTML == "") {
        html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);
      }
    }, 0);

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
      }
    };
    // Just once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={SCAN_REGION_ID} />;
}

export { Html5QrcodeScannerComponent };
