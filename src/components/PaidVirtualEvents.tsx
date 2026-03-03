import { useState } from "react";
import { Calendar, Users, Ticket, Video, Loader2, Plus, Clock, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { razorpayService, PRICES_INR, formatINR } from "@/integrations/razorpay/razorpayService";

interface VirtualEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxCapacity: number;
  registered: number;
  ticketPrice: number;
  zoomLink?: string;
  status: "upcoming" | "live" | "ended";
}

const PaidVirtualEvents = () => {
  const [events, setEvents] = useState<VirtualEvent[]>([
    {
      id: "1",
      title: "Web3 Development Masterclass",
      description: "Learn to build decentralized apps from blockchain experts",
      date: "2026-03-20",
      time: "19:00",
      duration: 120,
      maxCapacity: 500,
      registered: 342,
      ticketPrice: PRICES_INR.EVENT_TICKET,
      status: "upcoming",
    },
    {
      id: "2",
      title: "AI/ML for Production Systems",
      description: "Deploy ML models in production with best practices",
      date: "2026-03-25",
      time: "18:30",
      duration: 90,
      maxCapacity: 300,
      registered: 128,
      ticketPrice: PRICES_INR.EVENT_TICKET,
      status: "upcoming",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "19:00",
    duration: 90,
    maxCapacity: 500,
    ticketPrice: PRICES_INR.EVENT_TICKET,
  });

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.date || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create payment order for event creation fee
      const order = await razorpayService.createPaymentOrder({
        amount: PRICES_INR.EVENT_TICKET * 2, // Processing fee
        description: `Paid Event: ${formData.title}`,
        email: "organizer@yesz.in",
        name: "Event Organizer",
        phone: "9999999999",
        paymentType: "event",
        referenceId: formData.title,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      // Add event
      const newEvent: VirtualEvent = {
        id: Date.now().toString(),
        ...formData,
        registered: 0,
        status: "upcoming",
      };

      setEvents([...events, newEvent]);
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "19:00",
        duration: 90,
        maxCapacity: 500,
        ticketPrice: PRICES_INR.EVENT_TICKET,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (event: VirtualEvent) => {
    setLoading(true);
    try {
      // Create payment order for ticket
      const order = await razorpayService.createPaymentOrder({
        amount: event.ticketPrice,
        description: `Event Ticket: ${event.title}`,
        email: "attendee@yesz.in",
        name: "Event Attendee",
        phone: "9999999999",
        paymentType: "event",
        referenceId: event.id,
      });

      // Open payment modal
      await razorpayService.openPaymentCheckout({
        ...order,
        orderId: order.id,
        userId: "current_user_id",
      });

      alert("✅ Event registered! Check your email for Zoom link and details.");

      // Update registered count
      setEvents(
        events.map((e) =>
          e.id === event.id
            ? { ...e, registered: Math.min(e.registered + 1, e.maxCapacity) }
            : e
        )
      );
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to register for event");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSeats = (event: VirtualEvent) => {
    return event.maxCapacity - event.registered;
  };

  const getOccupancyPercent = (event: VirtualEvent) => {
    return Math.round((event.registered / event.maxCapacity) * 100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/profile?tab=events"
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
          <Video className="h-8 w-8 text-primary" />
          Paid Virtual Events
        </h1>
        <p className="text-muted-foreground">Host exclusive tech talks & webinars • ₹750/ticket</p>
      </motion.div>

      {/* Create Event Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(!showForm)}
        className="mb-8 px-6 py-3 bg-primary text-white font-bold rounded-lg flex items-center gap-2 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Create New Event
      </motion.button>

      {/* Event Creation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-xl bg-secondary border border-border space-y-4"
          >
            <h3 className="text-lg font-bold">Create Paid Event</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="number"
                placeholder="Max Capacity"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />

              <input
                type="number"
                placeholder="Ticket Price (₹)"
                value={formData.ticketPrice / 100}
                onChange={(e) => setFormData({ ...formData, ticketPrice: parseInt(e.target.value) * 100 })}
                className="px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>

            <textarea
              placeholder="Event Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
            />

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={handleCreateEvent}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  "Create Event"
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

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto opacity-20 mb-4" />
            <p>No events scheduled yet</p>
          </div>
        ) : (
          events.map((event) => {
            const occupancy = getOccupancyPercent(event);
            const available = getAvailableSeats(event);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-lg border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <p className="text-muted-foreground mt-1">{event.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      event.status === "upcoming"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : event.status === "live"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-gray-500/10 text-gray-600"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>

                {/* Event Details */}
                <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{event.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span>{formatINR(event.ticketPrice)} per ticket</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{event.registered}/{event.maxCapacity} registered</span>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Capacity</span>
                    <span className="text-sm text-muted-foreground">{occupancy}% full</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${occupancy}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                    />
                  </div>
                </div>

                {/* Registration */}
                {available > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRegisterEvent(event)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-primary text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Register Now - ${available} seats left`
                    )}
                  </motion.button>
                ) : (
                  <div className="w-full px-4 py-2 bg-secondary text-center rounded-lg font-bold text-muted-foreground">
                    Event Full
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PaidVirtualEvents;
