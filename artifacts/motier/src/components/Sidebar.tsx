import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Plus, MessageSquare, Trash2, Loader2, Feather } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useListOpenaiConversations, 
  useCreateOpenaiConversation, 
  useDeleteOpenaiConversation 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListOpenaiConversationsQueryKey } from "@workspace/api-client-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useListOpenaiConversations();
  
  const createMutation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setLocation(`/c/${data.id}`);
        if (onCloseMobile) onCloseMobile();
      }
    }
  });

  const deleteMutation = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        // If we deleted the current conversation, go home
        if (location === `/c/${variables.id}`) {
          setLocation("/");
        }
      }
    }
  });

  const handleCreate = () => {
    createMutation.mutate({ data: { title: "New Conversation" } });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="w-full md:w-72 flex-shrink-0 h-full bg-card border-r border-border/40 flex flex-col relative z-10 overflow-hidden">
      {/* Mystical Header */}
      <div className="p-6 border-b border-border/40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <Link href="/" onClick={onCloseMobile} className="block relative z-10 group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background border border-primary/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-500">
              <img 
                src={`${import.meta.env.BASE_URL}images/motier-avatar.png`} 
                alt="Dr. Motier" 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground tracking-wide group-hover:text-primary transition-colors">
                Dr. Motier
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-semibold mt-0.5">
                A Society of the Aware
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-background border border-border hover:border-primary/50 text-sm font-medium text-foreground hover:text-primary transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] disabled:opacity-50 group"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Feather className="w-4 h-4 group-hover:text-primary transition-colors" />
          )}
          <span>Initiate Discourse</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
          </div>
        ) : conversations?.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <p className="text-sm italic font-serif">The silence waits to be broken.</p>
          </div>
        ) : (
          <AnimatePresence>
            {conversations?.map((conv) => {
              const isActive = location === `/c/${conv.id}`;
              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <Link 
                    href={`/c/${conv.id}`}
                    onClick={onCloseMobile}
                    className={`
                      group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300
                      ${isActive 
                        ? 'bg-primary/10 border border-primary/20 shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]' 
                        : 'bg-transparent border border-transparent hover:bg-muted/50 hover:border-border/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <div className="flex flex-col truncate">
                        <span className={`text-sm font-medium truncate ${isActive ? 'text-primary-foreground' : 'text-foreground/80'}`}>
                          {conv.title || "Unknown Discourse"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conv.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className={`p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
                      title="Erase Memory"
                    >
                      {deleteMutation.isPending && deleteMutation.variables?.id === conv.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
