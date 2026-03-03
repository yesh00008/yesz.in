import { useState } from "react";
import { Megaphone, Send, CheckCircle, Loader2, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface SponsorshipRequest {
  id?: string;
  sponsor: string;
  content: string;
  contentType: "article" | "newsletter" | "video" | "podcast";
  budget: number;
  status: "pending" | "negotiating" | "accepted" | "published";
  dueDate: string;
}

const SponsoredContentMarketplace = () => {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([
    {
      id: "1",
      sponsor: "TechCorp Solutions",
      content: "Feature our new API framework in an article",
      contentType: "article",
      budget: PRICES_INR.SPONSORED_SMALL,
      status: "pending",
      dueDate: "2026-03-15",
    },
    {
      id: "2",
      sponsor: "CloudHost India",
      content: "Sponsor the tech newsletter for 3 months",
      contentType: "newsletter",
      budget: PRICES_INR.SPONSORED_MEDIUM,
      status: "negotiating",
      dueDate: "2026-04-01",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
    sponsor: "",
    content: "",
    contentType: "article" as const,
    budget: PRICES_INR.SPONSORED_SMALL,
  });

  const handleAddRequest = async () => {
    if (!newRequest.sponsor || !newRequest.content) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Create payment for sponsorship processing fee
      const order = await razorpayService.createPaymentOrder({
        amount: PRICES_INR.SPONSORED_SMALL, // Processing fee
        description: `Sponsored Content: ${newRequest.sponsor}`,
        email: "sponsor@yesz.in",
        name: newRequest.sponsor,
        phone: "9999999999",
        paymentType: "sponsored",
        referenceId: newRequest.sponsor,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      // Add to list
      const request: SponsorshipRequest = {
        id: Date.now().toString(),
        ...newRequest,
        status: "pending",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      };

      setRequests([...requests, request]);
      setNewRequest({
        sponsor: "",
        content: "",
        contentType: "article",
        budget: PRICES_INR.SPONSORED_SMALL,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to create sponsorship request");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request: SponsorshipRequest) => {
    if (!request.id) return;

    setLoading(true);
    try {
      // Create payment for actual sponsorship
      const order = await razorpayService.createPaymentOrder({
        amount: request.budget,
        description: `Sponsored Content Settlement: ${request.sponsor}`,
        email: "sponsor@yesz.in",
        name: request.sponsor,
        phone: "9999999999",
        paymentType: "sponsored",
        referenceId: request.id,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      // Update status
      setRequests(
        requests.map((r) =>
          r.id === request.id ? { ...r, status: "accepted" as const } : r
        )
      );
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to accept sponsorship");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      negotiating: "bg-blue-500/10 text-blue-600 border-blue-200",
      accepted: "bg-green-500/10 text-green-600 border-green-200",
      published: "bg-purple-500/10 text-purple-600 border-purple-200",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <Megaphone className="h-8 w-8 text-primary" />
          Sponsored Content
        </h1>
        <p className="text-muted-foreground">Let brands sponsor your content • ₹24,850 - ₹83,000</p>
      </motion.div>

      {/* Create Request Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        New Sponsorship Opportunity
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
            <h3 className="text-lg font-bold">New Sponsorship Proposal</h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Sponsor Company Name"
                value={newRequest.sponsor}
                onChange={(e) => setNewRequest({ ...newRequest, sponsor: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <select
                value={newRequest.contentType}
                onChange={(e) => setNewRequest({ ...newRequest, contentType: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              >
                <option value="article">Featured Article</option>
                <option value="newsletter">Newsletter Sponsorship</option>
                <option value="video">Video Sponsorship</option>
                <option value="podcast">Podcast Episode</option>
              </select>

              <textarea
                placeholder="What do they want to promote? (e.g., 'Feature our new API in a technical tutorial')"
                value={newRequest.content}
                onChange={(e) => setNewRequest({ ...newRequest, content: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Sponsorship Budget</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setNewRequest({ ...newRequest, budget: PRICES_INR.SPONSORED_SMALL })}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      newRequest.budget === PRICES_INR.SPONSORED_SMALL
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {formatINR(PRICES_INR.SPONSORED_SMALL)}
                  </button>
                  <button
                    onClick={() => setNewRequest({ ...newRequest, budget: PRICES_INR.SPONSORED_MEDIUM })}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      newRequest.budget === PRICES_INR.SPONSORED_MEDIUM
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {formatINR(PRICES_INR.SPONSORED_MEDIUM)}
                  </button>
                  <button
                    onClick={() => setNewRequest({ ...newRequest, budget: PRICES_INR.SPONSORED_LARGE })}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      newRequest.budget === PRICES_INR.SPONSORED_LARGE
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {formatINR(PRICES_INR.SPONSORED_LARGE)}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddRequest}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  "Send Proposal"
                )}
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

      {/* Requests List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <p>No sponsorship requests yet</p>
          </div>
        ) : (
          requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{request.sponsor}</h3>
                  <p className="text-sm text-muted-foreground">{request.content}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Content Type: <span className="capitalize font-bold">{request.contentType}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due Date: <span className="font-bold">{request.dueDate}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">{formatINR(request.budget)}</p>
                  {request.status === "pending" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptRequest(request)}
                      disabled={loading}
                      className="mt-2 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SponsoredContentMarketplace;
