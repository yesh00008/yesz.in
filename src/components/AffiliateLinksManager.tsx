import { useState } from "react";
import { Link, Copy, TrendingUp, DollarSign, CheckCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AffiliateLink {
  id?: string;
  program: string;
  url: string;
  rate: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

const AFFILIATE_PROGRAMS = [
  { name: "NordVPN", rate: 40, description: "VPN service - 40% commission" },
  { name: "HubSpot", rate: 30, description: "CRM platform - 30% recurring" },
  { name: "Kinsta", rate: 10, description: "Web hosting - $500 per sale" },
  { name: "Offer Daily", rate: 15, description: "Tech deals - 15% commission" },
  { name: "Refersion", rate: 25, description: "Affiliate network - 25% avg" },
  { name: "Amazon Associates", rate: 5, description: "Tech products - 5% commission" },
];

const AffiliateLinksManager = ({ postId }: { postId: string }) => {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddLink = () => {
    if (!selectedProgram || !affiliateUrl) {
      alert("Please select a program and enter affiliate URL");
      return;
    }

    const program = AFFILIATE_PROGRAMS.find((p) => p.name === selectedProgram);
    if (!program) return;

    const newLink: AffiliateLink = {
      id: Date.now().toString(),
      program: selectedProgram,
      url: affiliateUrl,
      rate: program.rate,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    setLinks([...links, newLink]);
    setAffiliateUrl("");
    setSelectedProgram("");
    setShowForm(false);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(link);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalRevenue = links.reduce((sum, link) => sum + link.revenue, 0);
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Affiliate Links
        </h1>
        <p className="text-muted-foreground">Earn commissions from your recommendations</p>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-secondary border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">₹{(totalRevenue / 100).toFixed(0)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-secondary border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
          <p className="text-2xl font-bold">{totalClicks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-secondary border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Active Links</p>
          <p className="text-2xl font-bold">{links.length}</p>
        </motion.div>
      </div>

      {/* Add Link Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Add Affiliate Link
      </motion.button>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-xl bg-secondary border border-border space-y-4"
          >
            <h3 className="text-lg font-bold">Add New Affiliate Link</h3>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Program</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {AFFILIATE_PROGRAMS.map((program) => (
                  <label
                    key={program.name}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-background cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="program"
                      value={program.name}
                      checked={selectedProgram === program.name}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Affiliate URL</label>
              <input
                type="url"
                placeholder="https://example.com/ref/your-link"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddLink}
                disabled={!selectedProgram || !affiliateUrl}
                className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                Add Link
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-secondary text-foreground font-bold rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Link className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <p>No affiliate links yet</p>
          </div>
        ) : (
          links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{link.program}</h3>
                  <p className="text-sm text-muted-foreground">{link.rate}% commission</p>
                </div>
                <button
                  onClick={() => handleCopyLink(link.url)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copiedId === link.url ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="p-3 bg-background rounded-lg mb-3 break-all text-sm font-mono text-muted-foreground">
                {link.url}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Clicks</p>
                  <p className="font-bold text-lg">{link.clicks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Conversions</p>
                  <p className="font-bold text-lg">{link.conversions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Revenue</p>
                  <p className="font-bold text-lg flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {(link.revenue / 100).toFixed(0)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AffiliateLinksManager;
