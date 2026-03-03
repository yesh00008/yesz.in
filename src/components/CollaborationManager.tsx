import { useState, useEffect } from "react";
import { Users, Plus, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Collaborator {
  id: string;
  collaborator_id: string;
  role: "editor" | "reviewer" | "contributor";
  status: "pending" | "accepted" | "declined";
  contribution_percentage: number;
  collaborator_name?: string;
  collaborator_email?: string;
}

interface CollaborationManagerProps {
  contentId: string;
  contentType: "post" | "paper";
  isAuthor: boolean;
}

const CollaborationManager = ({ contentId, contentType, isAuthor }: CollaborationManagerProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "reviewer" | "contributor">("contributor");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, [contentId, contentType]);

  const fetchCollaborators = async () => {
    try {
      const { data } = await supabase
        .from("content_collaborators")
        .select("*, collaborator:profiles(full_name, email)")
        .eq("content_id", contentId)
        .eq("content_type", contentType);

      if (data) {
        setCollaborators(
          data.map((c: any) => ({
            ...c,
            collaborator_name: c.collaborator?.full_name,
            collaborator_email: c.collaborator?.email,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  const inviteCollaborator = async () => {
    if (!email) return;
    try {
      // Find user by email
      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (user) {
        await supabase.from("content_collaborators").insert([
          {
            content_id: contentId,
            content_type: contentType,
            collaborator_id: user.id,
            role,
            status: "pending",
          },
        ]);
        setEmail("");
        setShowInvite(false);
        fetchCollaborators();
      }
    } catch (error) {
      console.error("Error inviting collaborator:", error);
    }
  };

  const updateCollaboratorStatus = async (collaboratorId: string, status: "accepted" | "declined") => {
    try {
      await supabase
        .from("content_collaborators")
        .update({ status, joined_at: status === "accepted" ? new Date().toISOString() : null })
        .eq("id", collaboratorId);
      fetchCollaborators();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      await supabase.from("content_collaborators").delete().eq("id", collaboratorId);
      fetchCollaborators();
    } catch (error) {
      console.error("Error removing collaborator:", error);
    }
  };

  if (loading) return <div>Loading collaborators...</div>;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5" /> Collaborators
        </h3>
        {isAuthor && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" /> Invite
          </button>
        )}
      </div>

      {showInvite && (
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg space-y-3">
          <input
            type="email"
            placeholder="Enter collaborator email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            <option value="contributor">Contributor</option>
            <option value="editor">Editor</option>
            <option value="reviewer">Reviewer</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={inviteCollaborator}
              className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Invite
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {collaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No collaborators yet
          </p>
        ) : (
          collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{collab.collaborator_name}</p>
                <p className="text-xs text-muted-foreground">{collab.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {collab.status === "pending" && (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </>
                )}
                {collab.status === "accepted" && (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-muted-foreground">Accepted</p>
                  </>
                )}
                {isAuthor && (
                  <button
                    onClick={() => removeCollaborator(collab.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollaborationManager;
