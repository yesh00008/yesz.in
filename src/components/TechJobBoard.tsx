import { useState } from "react";
import { Briefcase, MapPin, IndianRupee, Clock, Star, Loader2, Plus, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface JobListing {
  id?: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: "full-time" | "contract" | "freelance";
  description: string;
  featured?: boolean;
  postDate?: Date;
}

const TechJobBoard = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salaryMin: 300000,
    salaryMax: 600000,
    jobType: "full-time" as const,
    description: "",
    featured: false,
  });

  const regularListingPrice = PRICES_INR.SMALL_JOB; // ₹20,665
  const featuredListingPrice = regularListingPrice * 2; // ₹41,330

  const handleCreateJob = async () => {
    if (!formData.title || !formData.company) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create payment order
      const order = await razorpayService.createPaymentOrder({
        amount: formData.featured ? featuredListingPrice : regularListingPrice,
        description: `Tech Job Posting: ${formData.title} at ${formData.company}`,
        email: "creator@yesz.in",
        name: formData.company,
        phone: "9999999999",
        paymentType: "job_posting",
        referenceId: formData.title,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id", // Replace with actual user ID
      });

      // Add to local list
      setJobs([...jobs, { ...formData, postDate: new Date() }]);
      setFormData({
        title: "",
        company: "",
        location: "",
        salaryMin: 300000,
        salaryMax: 600000,
        jobType: "full-time",
        description: "",
        featured: false,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to create job posting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/profile?tab=jobs"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <Briefcase className="h-8 w-8 text-primary" />
          Tech Job Board
        </h1>
        <p className="text-muted-foreground">Hire top tech talent • ₹20,665 per listing</p>
      </motion.div>

      {/* Create Job Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Post New Job
      </motion.button>

      {/* Job Creation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-xl bg-secondary border border-border space-y-4"
          >
            <h3 className="text-lg font-bold">Post a New Job</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="text"
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value as any })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              >
                <option value="full-time">Full Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>

              <input
                type="number"
                placeholder="Min Salary (₹)"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: parseInt(e.target.value) })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="number"
                placeholder="Max Salary (₹)"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: parseInt(e.target.value) })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>

            <textarea
              placeholder="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Featured Listing (+{formatINR(featuredListingPrice - regularListingPrice)})
              </span>
            </label>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={handleCreateJob}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  `Publish Job - ${formatINR(formData.featured ? featuredListingPrice : regularListingPrice)}`
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-secondary text-foreground font-bold rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <p>No jobs posted yet</p>
          </div>
        ) : (
          jobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                {job.featured && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.jobType}
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  ₹{(job.salaryMin / 100000).toFixed(0)} - ₹{(job.salaryMax / 100000).toFixed(0)} LPA
                </span>
              </div>

              <p className="text-sm line-clamp-2">{job.description}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TechJobBoard;
