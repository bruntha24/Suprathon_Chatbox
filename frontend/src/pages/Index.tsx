import ChatWidget from "@/components/chat/ChatWidget";

const Index = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="mb-3 text-3xl font-bold text-foreground">Welcome to Our App</h1>
      <p className="text-muted-foreground">Click the chat icon to open support.</p>
    </div>
    <ChatWidget />
  </div>
);

export default Index;
