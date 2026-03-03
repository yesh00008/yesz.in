import { useState } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleProps {
  contentId: string;
  contentType: "post" | "paper";
  onScheduled?: () => void;
}

const ContentScheduler = ({ contentId, contentType, onScheduled }: ScheduleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSchedule = async () => {
    if (!date || !time) {
      setError("Please select both date and time");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduledDateTime = new Date(`${date}T${time}:00`);
      
      await supabase.from("scheduled_content").insert([
        {
          content_id: contentId,
          content_type: contentType,
          scheduled_publish_at: scheduledDateTime.toISOString(),
          timezone,
          is_scheduled: true,
          status: "scheduled",
        },
      ]);

      setIsOpen(false);
      setDate("");
      setTime("09:00");
      onScheduled?.();
    } catch (err) {
      setError("Failed to schedule content. Please try again.");
      console.error("Schedule error:", err);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
      >
        <Calendar className="h-4 w-4" />
        Schedule
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border border-border p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Schedule {contentType}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Publish Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={minDate}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Publish Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Kolkata">India</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentScheduler;
