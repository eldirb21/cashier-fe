import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type UseBarcodeScannerOptions = {
  isScanning: boolean;
  onScanSuccess: (decodedText: string) => void;
  elementId?: string;
};

export const useBarcodeScanner = ({
  isScanning,
  onScanSuccess,
  elementId = "reader",
}: UseBarcodeScannerOptions) => {
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          scanner = new Html5QrcodeScanner(
            elementId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              useBarCodeDetectorIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 10,
            },
            false,
          );

          scanner.render(
            (decodedText) => {
              onScanSuccess(decodedText);
              scanner?.clear();
            },
            () => {
              /* ignore error */
            },
          );
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scanner) {
          scanner
            .clear()
            .catch((err) => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [isScanning, elementId, onScanSuccess]);
};
