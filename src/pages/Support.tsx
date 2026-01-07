import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, MessageCircle, Search, Book, ChevronRight, Send, Bot, User, Ticket, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SupportView = 'home' | 'faq' | 'contact';
type TicketStatus = 'open' | 'pending_human' | 'in_progress' | 'resolved' | 'closed';

interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
}

interface SupportTicket {
  id: string;
  user_id: string;
  assigned_admin_id: string | null;
  status: TicketStatus;
  subject: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'navi' | 'admin';
  content: string;
  is_faq_response: boolean;
  faq_question: string | null;
  created_at: string;
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'navi' | 'admin';
  content: string;
  timestamp: Date;
  isFaqResponse?: boolean;
  faqQuestion?: string;
  showFeedback?: boolean;
  adminName?: string;
}

const FAQ_LIBRARY: FAQItem[] = [
  { question: "Can I change my username?", answer: "Yes! Go to Settings → Account → Change Username. You can change it once every 30 days.", keywords: ["username", "change", "name", "rename"] },
  { question: "Can I collaborate with others on UrbanShade?", answer: "Currently, UrbanShade is a single-user experience. However, you can message other users through the Messages app if you have a cloud account.", keywords: ["collaborate", "multiplayer", "together", "share"] },
  { question: "Can I customize the desktop?", answer: "Absolutely! Right-click on the desktop to access customization options, or go to Settings → Appearance to change themes, wallpapers, and more.", keywords: ["customize", "desktop", "theme", "wallpaper", "appearance"] },
  { question: "Can I export my data?", answer: "Yes! Go to Account Manager → Data to export your settings, messages, and other data in JSON format.", keywords: ["export", "data", "download", "backup"] },
  { question: "Can I install custom apps?", answer: "Yes! Use the UUR Manager to browse and install community-made packages. You can also submit your own packages.", keywords: ["install", "apps", "uur", "packages", "custom"] },
  { question: "Can I use UrbanShade offline?", answer: "Yes, but with limited functionality. Local mode works offline, but cloud features (messaging, sync) require an internet connection.", keywords: ["offline", "internet", "connection", "local"] },
  { question: "Do I need to create an account?", answer: "No! You can use UrbanShade in local mode without any account. Creating an account enables cloud sync and messaging features.", keywords: ["account", "register", "signup", "required"] },
  { question: "Does UrbanShade collect my personal data?", answer: "We only collect data necessary for cloud features (email, username, settings). We never sell your data. See our Privacy Policy for details.", keywords: ["data", "privacy", "collect", "personal", "information"] },
  { question: "Does UrbanShade cost anything?", answer: "No! UrbanShade is completely free. There are no premium tiers, hidden fees, or in-app purchases.", keywords: ["cost", "price", "free", "pay", "money", "premium"] },
  { question: "Does UrbanShade work on mobile?", answer: "UrbanShade is designed for desktop browsers. While it may partially work on tablets, we recommend using a computer for the best experience.", keywords: ["mobile", "phone", "tablet", "touch", "responsive"] },
  { question: "How do I become a moderator?", answer: "Moderators are selected by the admin team based on community contributions and trust. There's no application process - we'll reach out if we think you'd be a good fit.", keywords: ["moderator", "mod", "staff", "apply", "join team"] },
  { question: "How do I change my password?", answer: "Go to Account Manager → Security → Change Password. You'll need to enter your current password to set a new one.", keywords: ["password", "change", "security", "credentials"] },
  { question: "How do I contact support?", answer: "You can use the Contact Support option on this page, message an admin through the Messages app, or email emailbot00noreply@gmail.com for urgent issues.", keywords: ["support", "contact", "help", "admin", "email"] },
  { question: "How do I delete my account?", answer: "Go to Account Manager → Danger Zone → Delete Account. This action is irreversible and will delete all your data.", keywords: ["delete", "account", "remove", "close", "terminate"] },
  { question: "How do I enable dark mode?", answer: "UrbanShade uses a dark theme by default! You can adjust colors in Settings → Appearance.", keywords: ["dark mode", "theme", "light", "colors"] },
  { question: "How do I get unbanned?", answer: "If you believe your ban was a mistake, contact an admin through email at emailbot00noreply@gmail.com. Include your username and explain the situation.", keywords: ["unban", "banned", "appeal", "suspended"] },
  { question: "How do I report a bug?", answer: "Use the Messages app to contact an admin, or submit an issue on our GitHub repository. Include steps to reproduce the bug.", keywords: ["bug", "report", "issue", "problem", "glitch"] },
  { question: "How do I report a user?", answer: "In the Messages app, open the conversation with the user you want to report and click the Report button. Admins will review your report.", keywords: ["report", "user", "abuse", "harassment", "block"] },
  { question: "How do I reset my settings?", answer: "Go to Settings → Advanced → Reset Settings. You can choose to reset specific categories or all settings.", keywords: ["reset", "settings", "default", "restore"] },
  { question: "How do I sign out?", answer: "Click on your profile in the Start Menu and select 'Sign out', or go to Settings → Account → Sign Out.", keywords: ["signout", "logout", "sign out", "log out"] },
  { question: "How do I sync my data across devices?", answer: "Create a cloud account and enable sync in Settings → Online Account. Your settings will automatically sync every 2 minutes.", keywords: ["sync", "devices", "cloud", "backup", "cross-device"] },
  { question: "How do I use keyboard shortcuts?", answer: "Press Ctrl+? to see all available keyboard shortcuts, or check the documentation at /docs/shortcuts.", keywords: ["keyboard", "shortcuts", "hotkeys", "keys"] },
  { question: "How does the ban system work?", answer: "Minor violations result in warnings. Repeated issues lead to temporary bans (1h to 30 days). Serious violations result in permanent bans.", keywords: ["ban", "system", "rules", "moderation", "punishment"] },
  { question: "How does the messaging rate limit work?", answer: "You can send 15 messages per 5 minutes. After hitting the limit, you'll need to wait before sending more. This prevents spam.", keywords: ["rate limit", "messages", "limit", "spam", "cooldown"] },
  { question: "I forgot my password, how do I recover it?", answer: "Click 'Forgot Password' on the login screen and enter your email. We'll send you a reset link.", keywords: ["forgot", "password", "recover", "reset", "lost"] },
  { question: "Is my data secure?", answer: "Yes! We use Supabase with Row Level Security (RLS) policies. Your data is encrypted and stored securely.", keywords: ["secure", "security", "safe", "encryption", "data"] },
  { question: "Is the team trustworthy?", answer: "We're a small, passionate team based in the EU (Latvia). We follow GDPR and EU laws. Check our Team page to learn more about us.", keywords: ["team", "trustworthy", "trust", "safe", "legitimate", "who"] },
  { question: "Is UrbanShade open source?", answer: "The project is hosted on GitHub and you can view the codebase. We welcome contributions and feedback!", keywords: ["open source", "github", "code", "contribute", "repository"] },
  { question: "What are badges and how do I get them?", answer: "Badges are visual indicators of your role (Admin, Mod, VIP, Creator). They're assigned by the admin team based on contributions or special status.", keywords: ["badges", "roles", "vip", "admin", "special"] },
  { question: "What browsers are supported?", answer: "We recommend Chrome, Firefox, or Edge (latest versions). Safari works but may have minor issues. Internet Explorer is not supported.", keywords: ["browser", "chrome", "firefox", "safari", "edge", "support"] },
  { question: "What happens if I get banned?", answer: "You'll see a ban screen explaining why you were banned. Temporary bans show a countdown. Permanent bans cannot be appealed for serious violations.", keywords: ["banned", "ban", "suspended", "blocked"] },
  { question: "What is DEF-DEV mode?", answer: "DEF-DEV is a developer/debugging mode with advanced tools for inspecting the system state, viewing logs, and testing features. Access it via /def-dev or the Terminal.", keywords: ["defdev", "def-dev", "developer", "debug", "tools"] },
  { question: "What is local mode vs cloud mode?", answer: "Local mode stores everything in your browser (no account needed). Cloud mode syncs your data to our servers, enabling cross-device access and messaging.", keywords: ["local", "cloud", "mode", "difference", "storage"] },
  { question: "What is NAVI?", answer: "NAVI is our AI security system that monitors for suspicious behavior and helps with automated moderation. It's named after a helpful AI companion.", keywords: ["navi", "ai", "security", "system", "bot"] },
  { question: "What is the UUR Manager?", answer: "UUR (UrbanShade User Repository) is our package manager for installing community-made apps and tools.", keywords: ["uur", "manager", "packages", "repository", "apps"] },
  { question: "What is UrbanShade OS?", answer: "UrbanShade OS is a browser-based operating system simulator. It's a fun project that recreates the desktop experience in your web browser.", keywords: ["what", "urbanshade", "about", "os", "simulator"] },
  { question: "Where is my data stored?", answer: "Local mode stores data in your browser's localStorage. Cloud mode uses Supabase servers (secure, GDPR-compliant infrastructure).", keywords: ["data", "stored", "location", "server", "where"] },
  { question: "Why am I seeing a maintenance screen?", answer: "We occasionally take the system offline for updates or maintenance. This usually lasts only a few minutes. Check our status page for updates.", keywords: ["maintenance", "down", "offline", "unavailable"] },
  { question: "Why can't I send messages?", answer: "You might have hit the rate limit (15 messages per 5 minutes), or your account may be restricted. Check if you have any pending warnings.", keywords: ["messages", "send", "blocked", "cant", "unable"] },
  { question: "Why did my session expire?", answer: "For security, sessions expire after extended inactivity. Simply sign in again to continue.", keywords: ["session", "expired", "logged out", "automatic"] },
].sort((a, b) => a.question.localeCompare(b.question));

// FAQ matching algorithm
function findBestFAQMatch(userMessage: string): FAQItem | null {
  const userWords = userMessage.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  if (userWords.length === 0) return null;
  
  let bestMatch: FAQItem | null = null;
  let bestScore = 0;
  const THRESHOLD = 3;
  
  for (const faq of FAQ_LIBRARY) {
    let score = 0;
    
    // Check keyword matches (high weight)
    for (const keyword of faq.keywords) {
      if (userWords.some(word => 
        word.includes(keyword) || keyword.includes(word)
      )) {
        score += 2;
      }
    }
    
    // Check question word overlap (medium weight)
    const questionWords = faq.question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    for (const word of userWords) {
      if (questionWords.includes(word)) {
        score += 1;
      }
    }
    
    // Check answer word overlap (low weight)
    const answerWords = faq.answer.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    for (const word of userWords) {
      if (answerWords.includes(word)) {
        score += 0.5;
      }
    }
    
    if (score > bestScore && score >= THRESHOLD) {
      bestMatch = faq;
      bestScore = score;
    }
  }
  
  return bestMatch;
}

const Support = () => {
  const [view, setView] = useState<SupportView>('home');
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username?: string } | null>(null);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [openTickets, setOpenTickets] = useState<SupportTicket[]>([]);
  const [assignedAdminName, setAssignedAdminName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Check auth and load tickets
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        setCurrentUser({ id: user.id, username: profile?.username });
        loadOpenTickets(user.id);
      }
    };
    checkAuth();
  }, []);

  // Real-time subscription for ticket messages
  useEffect(() => {
    if (!currentTicket) return;
    
    const channel = supabase
      .channel('ticket-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${currentTicket.id}`
        },
        async (payload) => {
          const newMsg = payload.new as TicketMessage;
          // Don't duplicate messages we just sent
          if (newMsg.sender_type === 'user' && newMsg.sender_id === currentUser?.id) return;
          
          let adminName: string | undefined;
          if (newMsg.sender_type === 'admin' && newMsg.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', newMsg.sender_id)
              .single();
            adminName = profile?.username;
          }
          
          setChatMessages(prev => [...prev, {
            id: newMsg.id,
            role: newMsg.sender_type,
            content: newMsg.content,
            timestamp: new Date(newMsg.created_at),
            isFaqResponse: newMsg.is_faq_response,
            faqQuestion: newMsg.faq_question || undefined,
            adminName
          }]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTicket, currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadOpenTickets = async (userId: string) => {
    const { data, error } = await (supabase
      .from('support_tickets' as any)
      .select('*')
      .eq('user_id', userId)
      .in('status', ['open', 'pending_human', 'in_progress'])
      .order('created_at', { ascending: false }) as any);
    
    if (!error && data) {
      setOpenTickets(data as SupportTicket[]);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    setIsLoading(true);
    const { data, error } = await (supabase
      .from('ticket_messages' as any)
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true }) as any);
    
    if (!error && data) {
      const messages: ChatMessage[] = [];
      for (const msg of data as TicketMessage[]) {
        let adminName: string | undefined;
        if (msg.sender_type === 'admin' && msg.sender_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', msg.sender_id)
            .single();
          adminName = profile?.username ?? undefined;
        }
        
        messages.push({
          id: msg.id,
          role: msg.sender_type,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          isFaqResponse: msg.is_faq_response,
          faqQuestion: msg.faq_question || undefined,
          adminName
        });
      }
      setChatMessages(messages);
    }
    setIsLoading(false);
  };

  const openTicket = async (ticket: SupportTicket) => {
    setCurrentTicket(ticket);
    await loadTicketMessages(ticket.id);
    
    if (ticket.assigned_admin_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', ticket.assigned_admin_id)
        .single();
      setAssignedAdminName(profile?.username || null);
    }
    
    setView('contact');
  };

  const createNewTicket = async (): Promise<string | null> => {
    if (!currentUser) return null;
    
    const { data, error } = await (supabase
      .from('support_tickets' as any)
      .insert({
        user_id: currentUser.id,
        status: 'open'
      })
      .select()
      .single() as any);
    
    if (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    const ticket = data as unknown as SupportTicket;
    setCurrentTicket(ticket);
    setOpenTickets(prev => [ticket, ...prev]);
    return ticket.id;
  };

  const escalateToHuman = async (ticketId: string, userMessage: string) => {
    // Get random available admin
    const { data: adminData, error: adminError } = await (supabase
      .rpc('get_available_admin' as any) as any);
    
    const adminArray = adminData as { admin_id: string; username: string }[] | null;
    
    if (adminError || !adminArray || adminArray.length === 0) {
      // No admin available
      const naviMessage: ChatMessage = {
        role: 'navi',
        content: "I apologize, but there are no support staff available at the moment. Please try again later or email us directly at emailbot00noreply@gmail.com for urgent issues.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, naviMessage]);
      
      await (supabase.from('ticket_messages' as any).insert({
        ticket_id: ticketId,
        sender_type: 'navi',
        content: naviMessage.content
      }) as any);
      return;
    }
    
    const admin = adminArray[0];
    setAssignedAdminName(admin.username);
    
    // Update ticket with assigned admin
    await (supabase
      .from('support_tickets' as any)
      .update({
        assigned_admin_id: admin.admin_id,
        status: 'pending_human',
        subject: userMessage.slice(0, 100)
      })
      .eq('id', ticketId) as any);
    
    setCurrentTicket(prev => prev ? { ...prev, status: 'pending_human', assigned_admin_id: admin.admin_id } : null);
    
    // Send escalation message from NAVI
    const escalationContent = `Hello, and thank you for reaching out! 🎯\n\nYour issue has been pushed to @${admin.username}. Please wait until we respond! It may take some time.\n\nIn the meantime, feel free to add more details about your issue - they'll see everything you write here.`;
    
    const naviMessage: ChatMessage = {
      role: 'navi',
      content: escalationContent,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, naviMessage]);
    
    await (supabase.from('ticket_messages' as any).insert({
      ticket_id: ticketId,
      sender_type: 'navi',
      content: escalationContent
    }) as any);
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to use the support chat.",
        variant: "destructive"
      });
      return;
    }

    const userMessageContent = messageInput.trim();
    setMessageInput("");
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: userMessageContent,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Create or get ticket
    let ticketId = currentTicket?.id;
    if (!ticketId) {
      ticketId = await createNewTicket();
      if (!ticketId) return;
    }
    
    // Save user message to DB
    await (supabase.from('ticket_messages' as any).insert({
      ticket_id: ticketId,
      sender_id: currentUser.id,
      sender_type: 'user',
      content: userMessageContent
    }) as any);

    // If already escalated to human, just save message and wait
    if (currentTicket?.status === 'pending_human' || currentTicket?.status === 'in_progress') {
      return;
    }

    setIsTyping(true);
    
    // Simulate NAVI thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try to find FAQ match
    const faqMatch = findBestFAQMatch(userMessageContent);
    
    if (faqMatch) {
      // Found a matching FAQ
      const faqResponseContent = `I found something that might help! 🎯\n\n**Q: ${faqMatch.question}**\n\n${faqMatch.answer}\n\nDoes this answer your question?`;
      
      const naviResponse: ChatMessage = {
        role: 'navi',
        content: faqResponseContent,
        timestamp: new Date(),
        isFaqResponse: true,
        faqQuestion: faqMatch.question,
        showFeedback: true
      };
      
      setChatMessages(prev => [...prev, naviResponse]);
      
      await (supabase.from('ticket_messages' as any).insert({
        ticket_id: ticketId,
        sender_type: 'navi',
        content: faqResponseContent,
        is_faq_response: true,
        faq_question: faqMatch.question
      }) as any);
    } else {
      // No FAQ match - escalate to human immediately
      await escalateToHuman(ticketId, userMessageContent);
    }
    
    setIsTyping(false);
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!currentTicket) return;
    
    // Remove feedback buttons from the last message
    setChatMessages(prev => prev.map((msg, idx) => 
      idx === prev.length - 1 ? { ...msg, showFeedback: false } : msg
    ));
    
    if (helpful) {
      const thankYouMessage: ChatMessage = {
        role: 'navi',
        content: "Glad I could help! 😊 Is there anything else you'd like to know?",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, thankYouMessage]);
      
      await (supabase.from('ticket_messages' as any).insert({
        ticket_id: currentTicket.id,
        sender_type: 'navi',
        content: thankYouMessage.content
      }) as any);
    } else {
      // Escalate to human
      await escalateToHuman(currentTicket.id, "User indicated FAQ was not helpful");
    }
  };

  const startNewConversation = () => {
    setCurrentTicket(null);
    setChatMessages([]);
    setAssignedAdminName(null);
    setView('contact');
  };

  const filteredFAQs = FAQ_LIBRARY.filter(faq => {
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.keywords.some(k => k.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="border-cyan-500 text-cyan-400">Open</Badge>;
      case 'pending_human':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400">Waiting for Staff</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-purple-500 text-purple-400">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-400">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="border-slate-500 text-slate-400">Closed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {view !== 'home' ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-slate-300 hover:text-white"
                  onClick={() => {
                    setView('home');
                    setCurrentTicket(null);
                    setChatMessages([]);
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                    Back to OS
                  </Button>
                </Link>
              )}
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h1 className="text-xl font-bold text-white">Support Center</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {view === 'home' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">How can we help you?</h2>
              <p className="text-slate-400">Choose an option below to get started</p>
            </div>

            {/* Open Tickets Banner */}
            {openTickets.length > 0 && currentUser && (
              <Card className="bg-purple-900/30 border-purple-500/50 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    You have {openTickets.length} open ticket{openTickets.length > 1 ? 's' : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {openTickets.slice(0, 3).map(ticket => (
                    <div 
                      key={ticket.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                      onClick={() => openTicket(ticket)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 text-sm">
                          {ticket.subject || 'New conversation'}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group"
                onClick={() => setView('faq')}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                      <Book className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <span className="block">FAQ Resources</span>
                      <span className="text-sm font-normal text-slate-400">Browse our knowledge base</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:text-cyan-400 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p>Search through our comprehensive library of frequently asked questions. Find answers about accounts, features, troubleshooting, and more.</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={startNewConversation}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <MessageCircle className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <span className="block">Contact Support</span>
                      <span className="text-sm font-normal text-slate-400">Chat with our team</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:text-purple-400 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p>Need personalized help? Start a conversation with our support team. We'll get back to you as soon as possible.</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="mt-12 pt-8 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="flex flex-wrap gap-3">
                <Link to="/docs">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-600">
                    Documentation
                  </Button>
                </Link>
                <Link to="/docs/troubleshooting">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-600">
                    Troubleshooting Guide
                  </Button>
                </Link>
                <Link to="/status">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-600">
                    System Status
                  </Button>
                </Link>
                <Link to="/team">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:border-slate-600">
                    Meet the Team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {view === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Book className="w-8 h-8 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">FAQ Resources</h2>
                <p className="text-slate-400">Search our knowledge base ({FAQ_LIBRARY.length} questions)</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword or question..."
                className="pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12 text-lg"
                autoFocus
              />
            </div>

            {/* Results */}
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-3 pr-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No questions found matching "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try different keywords or <button onClick={startNewConversation} className="text-cyan-400 hover:underline">contact support</button></p>
                  </div>
                ) : (
                  filteredFAQs.map((faq, index) => (
                    <Card key={index} className="bg-slate-800/50 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-base font-medium">
                          {faq.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-slate-300 text-sm">
                        {faq.answer}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {view === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <MessageCircle className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Contact Support</h2>
                <p className="text-slate-400">Chat with NAVI or our team</p>
              </div>
            </div>

            {/* Not logged in warning */}
            {!currentUser && (
              <Card className="bg-yellow-900/30 border-yellow-500/50 mb-4">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-200 text-sm">
                    You need to be logged in to use the support chat. <Link to="/" className="underline">Go to UrbanShade OS</Link> to log in.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Chat Interface */}
            <Card className="bg-slate-800/50 border-slate-700 h-[calc(100vh-320px)] flex flex-col">
              <CardHeader className="border-b border-slate-700 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">NAVI Support</p>
                    <p className="text-xs text-slate-400">
                      {assignedAdminName ? `Assigned to @${assignedAdminName}` : 'Smart FAQ + Human Escalation'}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {currentTicket && getStatusBadge(currentTicket.status)}
                    {!currentTicket && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-slate-400">Online</span>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Start a conversation</p>
                      <p className="text-sm mt-2">I'll check our FAQ first - if I can't help, I'll connect you with a human!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={msg.id || index}>
                        <div
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role !== 'user' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              msg.role === 'admin' 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            }`}>
                              {msg.role === 'admin' ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : msg.role === 'admin'
                                ? 'bg-purple-900/50 border border-purple-500/30 text-slate-100 rounded-bl-md'
                                : 'bg-slate-700 text-slate-100 rounded-bl-md'
                            }`}
                          >
                            {msg.role === 'admin' && msg.adminName && (
                              <p className="text-xs text-purple-300 mb-1 font-medium">@{msg.adminName}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${
                              msg.role === 'user' ? 'text-primary-foreground/60' : 'text-slate-400'
                            }`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Feedback buttons */}
                        {msg.showFeedback && (
                          <div className="flex gap-2 ml-11 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20 gap-1"
                              onClick={() => handleFeedback(true)}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              Yes, thanks!
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20 gap-1"
                              onClick={() => handleFeedback(false)}
                            >
                              <ThumbsDown className="w-3 h-3" />
                              No, need human help
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-700 shrink-0">
                <form 
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex gap-3"
                >
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={currentUser ? "Type your message..." : "Please log in to send messages"}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[44px] max-h-32"
                    rows={1}
                    disabled={!currentUser}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="shrink-0 h-11 w-11"
                    disabled={!messageInput.trim() || !currentUser}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/" className="hover:text-white transition-colors">Back to UrbanShade OS</Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            For urgent issues, contact emailbot00noreply@gmail.com directly.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Support;
