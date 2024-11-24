import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { LoginForm } from "./LoginForm";

const LoginCard = () => {
  return (
    <div>
      <Card className="flex-col px-8">
        <CardHeader>
          <CardTitle className=" flex items-center justify-center text-foreground">
            Login:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginCard;
