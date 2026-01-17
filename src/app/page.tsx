import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoginForm />
    </div>
  );
}
