import HexagonWidget from "./HexagonWidget";
import { ChevronRight } from "lucide-react";

export default function MuchMoreWidget() {
  return (
    <HexagonWidget
      icon={<ChevronRight className="w-5 h-5" />}
      title="Much More"
      color="#14b8a6"
      expandedContent={
        <div>
          <p>Access additional checks including import status, VIC test results, and comprehensive vehicle specifications.</p>
        </div>
      }
    />
  );
}