import { useRef, useState, useEffect } from "react";
import "./ChatbotWidget.css";
import Logo from "../../assets/Nambi.png";
import Attach from "../../assets/paperclip.png";
import Collapse from "../../assets/down.png";
import Max from "../../assets/maximise.png";

// const API_BASE_URL = "http://127.0.0.1:5000";
const API_BASE_URL = "https://backend-api-nambi.onrender.com/";

type Message = {
  id: string;
  type: "user" | "bot";
  text?: string;
  createdAt: number;
  attachment?: {
    url: string;
    name: string;
    mimeType: string;
    isImage: boolean;
  };
};

const ChatbotWidget = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "Hello! How can I help you today?",
      createdAt: Date.now(),
    },
  ]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSendMessage = async (text?: string) => {
    const outgoingMessage = text ?? message;

    if (!outgoingMessage.trim() && !attachment) return;

    // Create attachment data if exists
    let attachmentData;
    if (attachment) {
      attachmentData = {
        url: URL.createObjectURL(attachment),
        name: attachment.name,
        mimeType: attachment.type,
        isImage: attachment.type.startsWith("image/"),
      };
    }

    // Add user message
    addMessage({
      id: Math.random().toString(),
      type: "user",
      text: outgoingMessage.trim() ? outgoingMessage : undefined,
      createdAt: Date.now(),
      attachment: attachmentData,
    });

    setMessage("");
    setAttachment(null);
    setShowQuickReplies(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: outgoingMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      addMessage({
        id: Math.random().toString(),
        type: "bot",
        text: data.answer,
        createdAt: Date.now(),
      });
      } catch{
        addMessage({
          id: Math.random().toString(),
          type: "bot",
          text: "Sorry, something went wrong. Please try again.",
          createdAt: Date.now(),
        });
      } finally {
        setLoading(false);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
  };

  return (
    <>
      {isCollapsed && (
        <button
          className="chatbot-collapsed-icon"
          onClick={() => setIsCollapsed(false)}
        >
          <img src={Logo} alt="Chatbot" width={40} height={40} />
        </button>
      )}

      {!isCollapsed && (
        <div className={`chatbot-container ${isFullscreen ? "fullscreen" : ""}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <img src={Logo} alt="Company logo" width={50} height={50} />
              </div>
              <span className="chatbot-title">Nambi</span>
            </div>

            <button
              className="chatbot-icon-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <img src={Max} alt="Maximise chatbot screen" width={"20px"} />
            </button>

            <button
              className="chatbot-icon-btn"
              onClick={() => setIsCollapsed(true)}
            >
              <img src={Collapse} alt="close chatbot" width={"20px"} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                <div className="chatbot-bubble">
                  {msg.text && <p>{msg.text}</p>}

                  {msg.attachment && msg.attachment.isImage && (
                    <img
                      className="chatbot-message-image"
                      src={msg.attachment.url}
                      alt={msg.attachment.name}
                    />
                  )}

                  {msg.attachment && !msg.attachment.isImage && (
                    <span className="chatbot-file">
                        {msg.attachment.name}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* QUICK REPLIES */}
            {showQuickReplies && !loading && (
              <div className="chatbot-quick-replies">
                <button onClick={() => handleSendMessage("About Everything Ug")}>
                  About Everything Ug
                </button>
                <button onClick={() => handleSendMessage("Create an Iternary")}>
                  Create an Iternary
                </button>
                <button onClick={() => handleSendMessage("Tailor Your Holiday")}>
                  Tailor Your Holiday
                </button>
              </div>
            )}

            {loading && (
              <div className="chatbot-message bot">
                <div className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachment preview */}
          {attachment && (
            <div className="chatbot-attachment-preview">
              {attachment.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(attachment)}
                  alt="preview"
                  className="chatbot-attachment-image"
                />
              ) : (
                <span className="chatbot-attachment-file">
                  {attachment.name}
                </span>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="chatbot-input">
            <button
              className="chatbot-attach-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={Attach} alt="attachment file" width={"20px"} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />

            <textarea
              className="chatbot-text-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
              className="chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || (!message.trim() && !attachment)}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
