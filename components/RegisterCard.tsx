import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { RegisterForm } from "./RegisterForm";

const RegisterCard = () => {
  return (
    <div>
      <Card className="flex-col px-8">
        <CardHeader>
          <CardTitle className=" flex items-center justify-center text-foreground">
            Register:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterCard;
