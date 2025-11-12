import {
  FileText, Mail, Share2, Download, ShieldAlert, FileClock, BadgePoundSterling, ShieldCheck
} from "lucide-react";
import s from "./MiniFeatureGrid.module.css";  // <-- scoped CSS module

type Item = { icon: any; title: string; sub: string; tint: string };
const ITEMS: Item[] = [
  { icon: FileText,           title: "Comprehensive Reports", sub: "60+ data points checked instantly",  tint: "#60A5FA" },
  { icon: Mail,               title: "Email PDF Reports",     sub: "Professional reports sent instantly",     tint: "#A78BFA" },
  { icon: Share2,             title: "Share Reports",         sub: "Send to clients with one click",      tint: "#F472B6" },
  { icon: Download,           title: "Save & Export",         sub: "Download PDF, CSV, Excel formats",          tint: "#FBBF24" },
  { icon: ShieldAlert,        title: "Insurance Write-Off Check", sub: "Category A, B, C, D, N & S verification",     tint: "#34D399" },
  { icon: FileClock,          title: "Full MOT History",      sub: "Complete test records & advisories",         tint: "#38BDF8" },
  { icon: BadgePoundSterling, title: "Outstanding Finance",   sub: "HP, PCP & lease checks included",           tint: "#FB7185" },
  { icon: ShieldCheck,        title: "Stolen Vehicle Check",  sub: "PNC database verification",            tint: "#C084FC" },
];

export default function MiniFeatureGrid() {
  return (
    <section className={s.scope}>
      <div className={s.bg} aria-hidden="true" />
      <div className={s.grid}>
        {ITEMS.map(({ icon:Icon, title, sub, tint }, i) => (
          <div 
            key={i} 
            className={s.card} 
            style={{ 
              ["--chip-tint" as any]: tint, 
              ["--delay" as any]: `${i * 180}ms` 
            }}
          >
            <div className={s.content}>
              <div className={s.row}>
                <span className={s.chip}>
                  <Icon className={s.glyph} />
                </span>
                <div className={s.text}>
                  <div className={s.title}>{title}</div>
                  <div className={s.sub}>{sub}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}