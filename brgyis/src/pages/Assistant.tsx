import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { streamMessageToOllama, checkOllamaStatus, getAvailableModels, OllamaMessage } from "@/lib/ollama";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
}

const quickActions = [
  "How do I get a Barangay Clearance?",
  "What are the requirements for Certificate of Indigency?",
  "How to file a blotter report?",
  "What are the office hours?",
];

const INITIAL_MESSAGE = "Hello! I'm your Barangay Assistant. I'm ready to help you with:\n\n📄 **Documents:** Clearances, Certificates, Permits\n🚨 **Blotter:** Report filing and procedures\nℹ️ **Information:** Office hours, requirements, contacts\n💼 **Services:** Business permits, community services\n\nI'm currently in Smart Mode and ready to answer your questions!\n\nHow can I assist you today?";

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: INITIAL_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
  const [isCheckingOllama, setIsCheckingOllama] = useState<boolean>(false);
  const [nextRetryAt, setNextRetryAt] = useState<Date | null>(null);
  const [conversationHistory, setConversationHistory] = useState<OllamaMessage[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("llama2");
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasOllamaConnected = useRef<boolean>(false);
  const updateStatus = useCallback(
    async (manual = false) => {
      setIsCheckingOllama(true);
      const ok = await checkOllamaStatus();
      setIsOllamaAvailable(ok);
      setIsCheckingOllama(false);

      if (ok && !wasOllamaConnected.current) {
        toast({
          title: "Connected to Ollama",
          description: "Enhanced AI Mode is now active.",
        });
        wasOllamaConnected.current = true;
        setLastConnectedAt(new Date());
      }
      if (!ok && wasOllamaConnected.current) {
        toast({
          title: "Ollama disconnected",
          description: "Switched to Smart Fallback Mode.",
        });
        wasOllamaConnected.current = false;
      }

      if (ok) {
        const available = await getAvailableModels();
        setModels(available);
        if (available.includes("llama2")) {
          setSelectedModel("llama2");
        } else if (available.length > 0) {
          setSelectedModel(available[0]);
        }
      }

      return ok;
    },
    []
  );

  const handleReconnectNow = useCallback(async () => {
    setNextRetryAt(null); // clear any scheduled retry display
    setIsCheckingOllama(true);
    
    // Try to reconnect with a small delay to ensure UI feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const connected = await updateStatus(true);
    
    if (connected) {
      toast({
        title: "✓ Reconnected Successfully",
        description: "Ollama is now active. Enhanced AI Mode enabled!",
      });
    } else {
      toast({
        title: "Unable to Connect",
        description: "Make sure Ollama is running. Click 'Reconnect now' to try again.",
        variant: "destructive",
      });
    }
    
    setIsCheckingOllama(false);
  }, [updateStatus]);

  useEffect(() => {
    let mounted = true;
    let retryTimer: NodeJS.Timeout | null = null;

    const check = async () => {
      const ok = await updateStatus();
      if (!mounted) return;
      if (!ok) {
        const ts = new Date(Date.now() + 5000);
        setNextRetryAt(ts);
        retryTimer = setTimeout(() => {
          setNextRetryAt(null);
          check();
        }, 5000);
      }
    };

    check();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [updateStatus]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Add loading message (will stream content)
    const loadingMessage: Message = {
      id: messages.length + 2,
      type: "bot",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Stream response from Ollama (or fallback)
      const full = await streamMessageToOllama(
        messageContent,
        conversationHistory,
        selectedModel,
        (chunk, done) => {
          if (chunk) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === loadingMessage.id
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          }
          if (done) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === loadingMessage.id
                  ? { ...msg, isLoading: false }
                  : msg
              )
            );
          }
        }
      );

      // Update conversation history with streamed full response
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: messageContent },
        { role: "assistant", content: full },
      ]);
    } catch (error) {
      // Replace loading message with error message
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: errorMessage,
                isLoading: false,
                isError: true,
              }
            : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar mode="user" />
      <div className="flex-1 pl-64 flex flex-col">
        <div className="flex h-[calc(100vh-140px)] flex-col animate-fade-in">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Barangay Assistant
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI-powered help for barangay services
                {isOllamaAvailable === false && (
                    <span className="text-amber-500 text-xs ml-2">• Smart Fallback Mode (Ollama not connected)</span>
                )}
                {isOllamaAvailable === true && (
                  <span className="text-green-500 text-xs ml-2">• Enhanced AI Mode (Ollama)</span>
                )}
                {isOllamaAvailable === null && (
                  <span className="text-muted-foreground text-xs ml-2 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking Ollama...
                  </span>
                )}
                {lastConnectedAt && (
                  <span className="text-muted-foreground text-[11px] ml-2">
                    Last connected: {lastConnectedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {nextRetryAt && isOllamaAvailable === false && (
                  <span className="text-muted-foreground text-[11px] ml-2">
                    Next retry: {nextRetryAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleReconnectNow}
                disabled={isCheckingOllama}
              >
                {isCheckingOllama ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Reconnecting...
                  </span>
                ) : (
                  "Reconnect now"
                )}
              </Button>
            </div>
          </div>

          {/* Ollama Status Alert */}
          {isOllamaAvailable === false && (
            <Alert className="mt-3 border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                  <strong>Smart Mode Active:</strong> I'm providing helpful responses based on common barangay services.
                  You can continue chatting now. For enhanced AI capabilities, install <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Ollama</a> (optional).
              </AlertDescription>
            </Alert>
          )}
          {isOllamaAvailable === true && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Model:</label>
              <select
                className="border rounded-md text-sm px-2 py-1 bg-background"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.length === 0 ? (
                  <option value="llama2">llama2</option>
                ) : (
                  models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="flex-1 rounded-xl border bg-card shadow-card overflow-hidden flex flex-col">
          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-slide-up",
                    message.type === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.type === "bot"
                        ? "gradient-primary"
                        : "bg-secondary"
                    )}
                  >
                    {message.type === "bot" ? (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3",
                      message.type === "bot"
                        ? message.isError
                          ? "bg-destructive/10 text-destructive rounded-tl-none border border-destructive/20"
                          : "bg-muted text-foreground rounded-tl-none"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    )}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-line">
                        {message.content}
                      </p>
                    )}
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        message.type === "bot"
                          ? message.isError 
                            ? "text-destructive/70"
                            : "text-muted-foreground"
                          : "text-primary-foreground/70"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Quick questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5"
                  onClick={() => handleSend(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1"
                disabled={messages.some(m => m.isLoading) || isCheckingOllama}
              />
              <Button 
                onClick={() => handleSend()} 
                size="icon"
                disabled={!input.trim() || messages.some(m => m.isLoading) || isCheckingOllama}
              >
                {messages.some(m => m.isLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
