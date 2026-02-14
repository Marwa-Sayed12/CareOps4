import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

interface Message {
  _id: string;
  content: string;
  sender: "system" | "staff" | "contact";
  timestamp: string;
}

interface Conversation {
  _id: string;
  contact: {
    _id: string;
    fullName: string;
    email?: string;
  } | null;
  messages: Message[];
  status: string;
}

const Inbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");

  // Fetch conversations
  useEffect(() => {
    if (!user?.token) return;

    fetch("http://localhost:5000/api/conversations", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(res => res.json())
      .then(data => {
        setConversations(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(console.error);
  }, [user]);

  // Send message
  const sendMessage = async () => {
    if (!selected || reply.trim() === "") return;

    const res = await fetch(
      `http://localhost:5000/api/conversations/${selected._id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          content: reply,
          sender: "staff",
        }),
      }
    );

    const updated = await res.json();

    setConversations(prev =>
      prev.map(c => (c._id === updated._id ? updated : c))
    );

    setSelected(updated);
    setReply("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      {/* Conversation List */}
      <div className="w-80 border-r border-border flex flex-col bg-card flex-shrink-0">
        <div className="flex-1 overflow-auto">
          {conversations.map(conv => (
            <button
              key={conv._id}
              onClick={() => setSelected(conv)}
              className={`w-full text-left p-4 border-b border-border transition-colors ${
                selected?._id === conv._id
                  ? "bg-accent"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {conv.contact?.fullName || "Unknown"}
                </span>

                <span className="text-xs text-muted-foreground">
                  {conv.messages.length > 0
                    ? new Date(
                        conv.messages[conv.messages.length - 1].timestamp
                      ).toLocaleTimeString()
                    : ""}
                </span>
              </div>

              <p className="text-xs text-muted-foreground truncate">
                {conv.messages.length > 0
                  ? conv.messages[conv.messages.length - 1].content
                  : "No messages yet"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <h3 className="font-semibold text-foreground">
            {selected?.contact?.fullName || "Select a conversation"}
          </h3>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {selected?.messages.map(msg => (
            <div
              key={msg._id}
              className={`flex ${
                msg.sender === "staff"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  msg.sender === "system"
                    ? "bg-muted text-muted-foreground text-center italic text-xs max-w-full w-full"
                    : msg.sender === "staff"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-[10px] mt-1 text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Input */}
        <div className="p-4 border-t border-border bg-card flex gap-2">
          <Input
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />

          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
