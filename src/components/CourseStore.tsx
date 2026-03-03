import { useState } from "react";
import { BookOpen, Play, Award, Users, ShoppingCart, Loader2, Plus, Star, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface Course {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: "course" | "ebook" | "tutorial";
  moduleCount: number;
  students: number;
  rating: number;
  thumbnail?: string;
}

const CourseStore = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "Advanced React Patterns",
      description: "Master React with hooks, context, and advanced patterns",
      price: PRICES_INR.MEDIUM_COURSE,
      category: "Web Development",
      type: "course",
      moduleCount: 12,
      students: 1243,
      rating: 4.8,
    },
    {
      id: "2",
      title: "Web3 Development Guide",
      description: "Build decentralized apps with Solidity and Web3.js",
      price: PRICES_INR.LARGE_COURSE,
      category: "Blockchain",
      type: "course",
      moduleCount: 15,
      students: 856,
      rating: 4.7,
    },
    {
      id: "3",
      title: "DevOps Essentials",
      description: "Docker, Kubernetes, and cloud deployment mastery",
      price: PRICES_INR.MEDIUM_COURSE,
      category: "DevOps",
      type: "course",
      moduleCount: 10,
      students: 2104,
      rating: 4.9,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: PRICES_INR.MEDIUM_COURSE,
    category: "Web Development",
    type: "course" as const,
    moduleCount: 5,
  });

  const handleEnroll = async (course: Course) => {
    setLoading(true);
    try {
      // Create payment order
      const order = await razorpayService.createPaymentOrder({
        amount: course.price,
        description: `Enroll in: ${course.title}`,
        email: "student@yesz.in",
        name: "Student",
        phone: "9999999999",
        paymentType: "course",
        referenceId: course.id,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      alert("✅ Congratulations! You're enrolled in the course. Check your email for access link.");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process enrollment");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      ...formData,
      students: 0,
      rating: 0,
    };

    setCourses([...courses, newCourse]);
    setFormData({
      title: "",
      description: "",
      price: PRICES_INR.MEDIUM_COURSE,
      category: "Web Development",
      type: "course",
      moduleCount: 5,
    });
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        to="/profile?tab=courses"
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
          <BookOpen className="h-8 w-8 text-primary" />
          Courses & Ebooks
        </h1>
        <p className="text-muted-foreground">Learn from industry experts • ₹1,580 - ₹8,250</p>
      </motion.div>

      {/* Create Course Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Create Course
      </motion.button>

      {/* Course Creation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-xl bg-secondary border border-border space-y-4"
          >
            <h3 className="text-lg font-bold">Create New Course</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              >
                <option value="course">Course</option>
                <option value="ebook">Ebook</option>
                <option value="tutorial">Tutorial Series</option>
              </select>

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="DevOps">DevOps</option>
                <option value="Blockchain">Blockchain</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="number"
                placeholder="Number of Modules"
                value={formData.moduleCount}
                onChange={(e) => setFormData({ ...formData, moduleCount: parseInt(e.target.value) })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Price</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, price: PRICES_INR.SMALL_COURSE })}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      formData.price === PRICES_INR.SMALL_COURSE
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    ₹1,580
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, price: PRICES_INR.MEDIUM_COURSE })}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      formData.price === PRICES_INR.MEDIUM_COURSE
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    ₹4,980
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, price: PRICES_INR.LARGE_COURSE })}
                    className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${
                      formData.price === PRICES_INR.LARGE_COURSE
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    ₹8,250
                  </button>
                </div>
              </div>
            </div>

            <textarea
              placeholder="Course Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
            />

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg"
              >
                Create Course
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

      {/* Courses Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
          >
            {/* Thumbnail Placeholder */}
            <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>

            <div className="p-4 space-y-3">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-bold capitalize">
                  {course.type}
                </span>
                {course.rating > 4.5 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-yellow-500" />
                    <span className="text-sm font-bold">{course.rating}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold line-clamp-2">{course.title}</h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

              {/* Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {course.moduleCount} modules
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {course.students} students
                </span>
              </div>

              {/* Price & Button */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-bold text-lg">{formatINR(course.price)}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEnroll(course)}
                  disabled={loading}
                  className="p-2 bg-primary text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseStore;
