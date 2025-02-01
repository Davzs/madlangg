import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Card } from "@/components/ui/card";
import LearningSessionComponent from "./learning-session";

export default async function LearningSessionPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <Card className="p-6">
        <LearningSessionComponent />
      </Card>
    </div>
  );
}
