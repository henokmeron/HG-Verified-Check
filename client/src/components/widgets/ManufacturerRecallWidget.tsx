import HexagonWidget from "./HexagonWidget";
import { AlertCircle } from "lucide-react";

export default function ManufacturerRecallWidget() {
  return (
    <HexagonWidget
      icon={<AlertCircle className="w-5 h-5" />}
      title="Manufacturer Recall"
      color="#65a30d"
      expandedContent={
        <div>
          <p>Check for any outstanding manufacturer recalls or safety notices.</p>
        </div>
      }
    />
  );
}