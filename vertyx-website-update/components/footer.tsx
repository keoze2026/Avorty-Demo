import { Phone } from "lucide-react"

export function Footer() {
  const footerLinks = {
    Platform: ["Live Monitor", "Routing Builder", "Marketplace", "AI Insights", "Numbers", "Analytics"],
    Resources: ["Documentation", "API Reference", "Webhooks", "Changelog", "Status", "SDK"],
    Company: ["About", "Customers", "Careers", "Blog", "Press", "Contact"],
    Legal: ["Privacy", "Terms", "Security", "TCPA", "HIPAA", "SOC 2"],
  }

  return (
    <footer className="border-t border-zinc-800 py-16 px-6" style={{ backgroundColor: "#09090B" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Vortyx</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              A real-time call tracking, routing, and analytics platform for modern pay-per-call marketers.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-medium text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">© 2026 Vortyx Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-emerald-400 text-sm flex items-center gap-2 hover:text-emerald-300 transition-colors">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              ALL SYSTEMS OPERATIONAL
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
